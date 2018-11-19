package spr;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.californium.core.network.EndpointManager;

import dave.arguments.Arguments;
import dave.arguments.Option;
import dave.arguments.Option.OptionBuilder;
import dave.arguments.ParseException;
import dave.arguments.Parser;
import dave.util.SevereException;
import dave.util.ShutdownService;
import dave.util.TransformingConsumer;
import dave.util.Utils;
import dave.util.config.Configuration;
import dave.util.config.OptionHash;
import dave.util.log.LogBase;
import dave.util.log.Logger;
import dave.util.log.Severity;
import dave.util.log.SimpleFormatter;
import dave.util.log.Spacer;
import spr.common.SystemBuilder;
import spr.common.SystemBuilder.BaseModule;
import spr.common.SystemBuilder.DistributedNetwork;
import spr.common.SystemBuilder.FrontendModule;
import spr.common.SystemBuilder.MasterModule;
import spr.common.SystemBuilder.NetworkModule;
import spr.common.SystemBuilder.NodeLogicModule;
import spr.net.UniqueAddress;
import spr.unit.Units;

public class Start
{
	public static void main(String[] args)
	{
		LogBase.INSTANCE.registerSink(e -> true, new TransformingConsumer<>(new Spacer(e -> System.out.println(e), 1500, Utils.repeat("=", 100)), new SimpleFormatter()));
		LogBase.INSTANCE.start();
		
		ShutdownService.INSTANCE.register(LogBase.INSTANCE::stop);
		
		try
		{
			Configuration<Params> options = parseArguments(args);

			int coap_port = (int) options.get(Params.COAP_PORT);
			List<InetSocketAddress> coap_endpoints = EndpointManager.getEndpointManager().getNetworkInterfaces().stream()
//				.filter(a -> !a.isLoopbackAddress())
//				.filter(a -> a instanceof Inet6Address)
//				.filter(a -> a.getHostAddress().contains("%lowpan"))
				.map(a -> new InetSocketAddress(a, coap_port))
				.collect(Collectors.toList());

			SystemBuilder sys = new SystemBuilder(new DistributedNetwork());
			
			sys.install(new BaseModule());
			sys.install(new NetworkModule((int) options.get(Params.UDP_PORT)));
			sys.install(new NodeLogicModule(coap_endpoints));
			
			if(((boolean) options.get(Params.MASTER)))
			{
				sys.install(new MasterModule());
				sys.install(new FrontendModule((int) options.get(Params.TCP_PORT)));
			}
			
			sys.run();
		}
		catch(Throwable e)
		{
			e.printStackTrace();
		}
		
		ShutdownService.INSTANCE.shutdown();
		
		System.exit(0);
	}
	
	private static Configuration<Params> parseArguments(String[] args) throws ParseException
	{
		Configuration<Params> opts = new OptionHash<>();
		
		Option o_coap_port = (new OptionBuilder("resource-port")).hasValue(true).build();
		Option o_tcp_port = (new OptionBuilder("master-port")).hasValue(true).build();
		Option o_udp_port = (new OptionBuilder("internal-port")).hasValue(true).build();
		Option o_master = (new OptionBuilder("master")).hasValue(true).build();
		Parser parser = new Parser(o_coap_port, o_tcp_port, o_udp_port, o_master);
		
		try
		{
			Arguments a = parser.parse(args);

			if(a.hasMainArgument())
				throw new IllegalArgumentException("Unexpected main argument: " + a.getMainArgument());

			if(a.hasArgument(o_coap_port))
			{
				opts.set(Params.COAP_PORT, Integer.parseInt(a.getArgument(o_coap_port)));
			}
			
			if(a.hasArgument(o_tcp_port))
			{
				opts.set(Params.TCP_PORT, Integer.parseInt(a.getArgument(o_tcp_port)));
			}
			
			if(a.hasArgument(o_udp_port))
			{
				opts.set(Params.UDP_PORT, Integer.parseInt(a.getArgument(o_udp_port)));
			}
			
			if(a.hasArgument(o_master)) try
			{
				if(a.hasArgument(o_tcp_port))
					throw new IllegalArgumentException("Only master may have a master-port!");
				
				String m = a.getArgument(o_master); int i = m.lastIndexOf(':');
				String host = m.substring(0, i);
				int port = Integer.parseInt(m.substring(i + 1));
				InetSocketAddress remote = new InetSocketAddress(InetAddress.getByName(host), port);

				Units.put(new UniqueAddress(Units.IDs.CONFIG, remote));
				Units.put(new UniqueAddress(Units.IDs.DATABASE, remote));
				Units.put(new UniqueAddress(Units.IDs.FRONTEND, remote));
				
				opts.set(Params.MASTER, false);
				
				Logger.DEFAULT.log(Severity.INFO, "Assigned remote master [%s]:%d", host, port);
			}
			catch(UnknownHostException e)
			{
				throw new SevereException(e);
			}
		}
		catch(ParseException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Invalid arguments: %s!", e.getMessage());
			
			System.err.println(e.getMessage());

			throw e;
		}
		
		return opts;
	}
	
	private static enum Params implements dave.util.config.Option
	{
		COAP_PORT(9900),
		TCP_PORT(9901),
		UDP_PORT(9902),
		MASTER(true)
		;

		@Override
		public Object getDefault()
		{
			return mDefault;
		}
		
		private final Object mDefault;
		
		private Params(Object o)
		{
			mDefault = o;
		}
	}
}
