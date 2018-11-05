package spr.unit;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;
import java.util.function.Predicate;

import dave.json.JsonArray;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.net.server.Connection;
import dave.net.server.Server;
import dave.net.server.StreamingTransceiver;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.LocalDatabaseUnit.Interval;

public class FrontendUnit extends BaseUnit
{
	private final Server mTCP;
	private final BlockingQueue<Entry> mConnected;
	private final BlockingQueue<Packet> mRequests;
	private final ExecutorService mAsync;
	private final Map<Predicate<JsonValue>, Consumer<Packet>> mCallbacks;
	private int mNextID;
	
	public FrontendUnit(int port, Node<Task> g) throws IOException
	{
		super(g);
		
		mConnected = new LinkedBlockingQueue<>();
		mRequests = new LinkedBlockingQueue<>();
		mAsync = Executors.newCachedThreadPool();
		mCallbacks = new HashMap<>();
		
		mTCP = Server.createTCPServer(port, new StreamingTransceiver(), this::handleConnection);
		
		registerAction("query-measurement", this::actQueryMeasurements);
		registerAction("query-devices", this::actQueryDevices);
		registerAction("put-device", this::actUpdateDevice);
		
		registerMessageHandler(Tasks.Database.DELIVER, this::handleMeasurements);
		registerMessageHandler(Tasks.Configuration.DELIVER, this::handleDevices);
		registerMessageHandler(Tasks.Frontend.ABORT, this::handleAbort);
	}
	
	@Override
	protected void onStart( )
	{
		mAsync.submit(this::run);
		mTCP.start();
	}
	
	@Override
	protected void onStop( )
	{
		mTCP.stop();
		mAsync.shutdown();
	}
	
	private void actQueryMeasurements(Packet p)
	{
		JsonObject req = (JsonObject) p.content;
		
		String id = req.getString("id");
		long i1 = req.getLong("from"), i2 = req.getLong("to");
		int count = req.getInt("count");
		Interval i = new Interval(id, i1, i2, count);
		
		LOG.log("Frontend requests data from %s (%d)", id, p.id);
		
		getNode().send(Units.IDs.DATABASE, new Task(Tasks.Database.RETRIEVE, p.id, i));
	}
	
	private void actQueryDevices(Packet p)
	{
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.QUERY, p.id));
	}
	
	private void actUpdateDevice(Packet p)
	{
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.CONFIGURE, p.id, p.content));
	}
	
	private Entry get(int id)
	{
		for(Iterator<Entry> i = mConnected.iterator() ; i.hasNext() ;)
		{
			Entry e = i.next();
			
			if(e.id == id)
			{
				i.remove();
				
				return e;
			}
		}
		
		throw new NoSuchElementException("" + id);
	}
	
	private void handleMeasurements(Message<Task> p)
	{
		int id = (int) p.getContent().getSession();
		
		try
		{
			Entry e = get(id);
			JsonObject data = p.getContent().getPayload();
			
			LOG.log("Frontend gets data from %s (%d)", data.get("id"), e.id);
			
			e.con.send(data.get("data"));
			e.con.close();
		}
		catch(IOException ex)
		{
			LOG.log(Severity.ERROR, "Failed to report back to frontend: %s", ex.getMessage());
		}
		catch(NoSuchElementException e)
		{
			LOG.log(Severity.ERROR, "Unknown connection %d!", id);
		}
	}
	
	private void handleDevices(Message<Task> p)
	{
		int id = (int) p.getContent().getSession();
		
		try
		{
			Entry e = get(id);
			JsonValue data = p.getContent().getPayload();
			
			LOG.log("Frontend received device list (%d devices)", ((JsonArray) data).size());
			
			e.con.send(data);
			e.con.close();
		}
		catch(IOException ex)
		{
			LOG.log(Severity.ERROR, "Failed to deliver device list: %s", ex.getMessage());
		}
	}
	
	private void handleAbort(Message<Task> p)
	{
		Integer id = p.getContent().getPayload();
		
		try
		{
			Entry e = get(id);
			
			e.con.close();
		}
		catch(IOException ex)
		{
			LOG.log(Severity.ERROR, "Failure while closing connection: %s", ex.getMessage());
		}
		catch(NoSuchElementException e)
		{
			LOG.log(Severity.ERROR, "Unknown connection %d!", id.intValue());
		}
	}
	
	private void registerAction(String a, Consumer<Packet> cb)
	{
		register(v -> {
			boolean f = false;
			
			if(v instanceof JsonObject)
			{
				JsonObject o = (JsonObject) v;
				
				if(o.contains("action"))
				{
					f = o.getString("action").equals(a);
				}
			}
			
			return f;
		}, cb);
	}
	
	private void register(Predicate<JsonValue> f, Consumer<Packet> cb)
	{
		mCallbacks.put(f, cb);
	}
	
	private void handleConnection(Connection c)
	{
		Entry entry = new Entry(c);
		
		mAsync.submit(() -> {
			try
			{
				JsonValue r = c.receive();
				
				mConnected.add(entry);
				mRequests.add(new Packet(entry.id, r));
			}
			catch(IOException e)
			{
				LOG.log(Severity.ERROR, "Client disconnected: %s", e.getMessage());
			}
		});
	}
	
	private int run( ) throws InterruptedException
	{
		while(true)
		{
			Packet p = mRequests.take();
			
			Consumer<Packet> cb = mCallbacks.entrySet().stream()
				.filter(e -> e.getKey().test(p.content))
				.map(e -> e.getValue()).findFirst().orElse(null);
			
			if(cb == null)
			{
				LOG.log("Received invalid request (%d): %s", p.id, p.content.toString());
				
				getNode().send(Units.IDs.FRONTEND, new Task(Tasks.Frontend.ABORT, newSession(), p.id));
			}
			else
			{
				try
				{
					cb.accept(p);
				}
				catch(Throwable e)
				{
					LOG.log(Severity.ERROR, "Request failed: %s", e.getMessage());
				}
			}
		}
	}
	
	private class Entry
	{
		public final int id;
		public final Connection con;
		
		public Entry(Connection c)
		{
			this.id = mNextID++;
			this.con = c;
		}
	}
	
	private class Packet
	{
		public final int id;
		public final JsonValue content;
		
		public Packet(int id, JsonValue content)
		{
			this.id = id;
			this.content = content;
		}
	}
	
	private static final Logger LOG = Logger.get("front-end-u");
}
