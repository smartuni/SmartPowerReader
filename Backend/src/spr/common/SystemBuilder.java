package spr.common;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;

import org.eclipse.californium.core.CoapServer;
import org.eclipse.californium.core.network.CoapEndpoint;

import dave.net.server.Server;
import dave.util.Distributor;
import dave.json.SevereIOException;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.client.SimpleStorage;
import spr.net.Backbone;
import spr.net.FakeBroker;
import spr.net.LocalBroker;
import spr.net.common.Broker;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.resource.HelloResource;
import spr.resource.MeasurementResource;
import spr.task.Task;
import spr.unit.CoapServerUnit;
import spr.unit.ConfigUnit;
import spr.unit.ConnectionUnit;
import spr.unit.FrontendUnit;
import spr.unit.LocalDatabaseUnit;
import spr.unit.SystemUnit;
import spr.unit.TimerUnit;
import spr.unit.Unit;
import spr.unit.Units;
import spr.unit.UserUnit;
import spr.util.FileVersioner;
import spr.util.FilenameGenerator;

public class SystemBuilder
{
	private final Backbone<Task> mNetwork;
	private final LocalBroker<Task> mNodes;
	private final List<Unit> mUnits;
	private final Function<Consumer<Message<Task>>, Consumer<Message<Task>>> mWrapper;
	private final Consumer<Message<Task>> mUplink;
	
	public SystemBuilder(Function<Consumer<Message<Task>>, Consumer<Message<Task>>> wrapper)
	{
		mNetwork = new Backbone<>();
		mNodes = new LocalBroker<>();
		mUnits = new ArrayList<>();
		mWrapper = wrapper;
		mUplink = mWrapper.apply(msg -> mNetwork.accept(msg));
		
		mNetwork.register(msg -> true, mNodes);
	}
	
	public SystemBuilder install(Unit u)
	{
		mUnits.add(u);
		
		u.getNode().setServer(old -> mUplink);
		u.getNode().setClient(old -> mWrapper.apply(msg -> u.accept(msg)));
		mNodes.register(u.getNode());
		
		LOG.log(Severity.INFO, "Installed unit %s", u.getNode().getID());
		
		return this;
	}
	
	public SystemBuilder uninstall(Unit u)
	{
		if(!mUnits.contains(u))
			throw new IllegalArgumentException("Does not contain " + u.getNode().getID() + "!");
		
		mNodes.deregister(u.getNode().getID());
		
		u.getNode().setServer(old -> (msg -> {}));
		
		mUnits.remove(u);
		
		LOG.log(Severity.INFO, "Removed unit %s", u.getNode().getID());
		
		return this;
	}
	
	public SystemBuilder install(Predicate<Message<Task>> f, Broker<Task> n)
	{
		mNetwork.register(f, n);
		
		return this;
	}
	
	public SystemBuilder install(Module m)
	{
		m.installOn(this);
		
		return this;
	}
	
	public void run( )
	{
		UserUnit user = new UserUnit(new Node<>(Units.IDs.USER));
		
		install(user);

		mNetwork.start();
		
		user.execute("start");
		
		for(Scanner in = new Scanner(System.in) ; user.isRunning() ;)
		{
			user.execute(in.nextLine());
		}

		mNetwork.stop();
	}
	
// # --------------------------------------------------------------------------
	
	public static interface Module { void installOn(SystemBuilder builder); }
	
	public static class BaseModule implements Module
	{
		@Override
		public void installOn(SystemBuilder builder)
		{
			builder.install(new SystemUnit(new Node<>(Units.IDs.SYSTEM)));
			builder.install(new TimerUnit(new Node<>(Units.IDs.TIMER)));
		}
	}
	
	public static class FrontendModule implements Module
	{
		private final int mPort;
		
		public FrontendModule(int port)
		{
			mPort = port;
		}

		@Override
		public void installOn(SystemBuilder builder)
		{
			try
			{
				builder.install(new FrontendUnit(mPort, new Node<>(Units.IDs.FRONTEND)));
			}
			catch(IOException e)
			{
				throw new SevereIOException(e);
			}
		}
	}
	
	public static class MasterModule implements Module
	{
		@Override
		public void installOn(SystemBuilder builder)
		{
			FileVersioner config_files = new FileVersioner((new File("config")).toPath(), new FilenameGenerator());
			
			builder.install(new LocalDatabaseUnit(id -> new SimpleStorage(new File("config/" + id + ".bin")), new Node<>(Units.IDs.DATABASE)));
			builder.install(new ConfigUnit(config_files.get(), config_files, new Node<>(Units.IDs.CONFIG)));
		}
	}
	
	public static class NetworkModule implements Module
	{
		private final int mPort;
		private int mNext;
		
		public NetworkModule(int p)
		{
			mPort = p;
			mNext = 0;
		}
		
		@Override
		public void installOn(SystemBuilder builder)
		{
			try
			{
				Server s = Server.createTCPServer(mPort, c -> {
					synchronized(this)
					{
						Unit u = new ConnectionUnit(c, uu -> builder.uninstall(uu), new Node<>(Units.IDs.CONNECTION + "-" + (mNext++)));
						
						builder.install(u);
					}
				});
				
				builder.install(msg -> false, new FakeBroker<>("tcp", s));
			}
			catch(IOException e)
			{
				throw new SevereIOException(e);
			}
		}
	}
	
	public static class NodeLogicModule implements Module
	{
		private final CoapServer mServer;
		
		public NodeLogicModule(List<InetSocketAddress> endpoints)
		{
			mServer = new CoapServer();
			
			endpoints.forEach(a -> mServer.addEndpoint(new CoapEndpoint(a)));
		}
		
		@Override
		public void installOn(SystemBuilder builder)
		{
			Node<Task> net = new Node<>(Units.IDs.COAP);
			
			mServer.add(new MeasurementResource(net));
			mServer.add(new HelloResource(net));
			
			builder.install(new CoapServerUnit(mServer, net));
		}
	}
	
// # --------------------------------------------------------------------------
	
	public static class SingleThreadedNetwork implements Function<Consumer<Message<Task>>, Consumer<Message<Task>>>
	{
		@Override
		public Consumer<Message<Task>> apply(Consumer<Message<Task>> msg)
		{
			return msg;
		}
	}
	
	public static class DistributedNetwork implements Function<Consumer<Message<Task>>, Consumer<Message<Task>>>
	{
		@Override
		public Consumer<Message<Task>> apply(Consumer<Message<Task>> t)
		{
			Distributor<Message<Task>> async = new Distributor<>(msg -> t.accept(msg));
			
			async.start();
			
			return async;
		}
	}
	
	private static final Logger LOG = Logger.get("builder");
}
