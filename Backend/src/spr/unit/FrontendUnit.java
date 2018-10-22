package spr.unit;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;
import java.util.function.Predicate;

import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.StreamBuffer;
import dave.json.StringBuffer;
import dave.net.server.Connection;
import dave.net.server.Server;
//import dave.net.server.StreamingTransceiver;
import dave.net.server.Transceiver;
import dave.util.Utils;
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
		
		mTCP = Server.createTCPServer(port, new Transceiver() {
			@Override
			public void send(OutputStream out, JsonValue json) throws IOException
			{
				String response = "HTTP/1.1 200 OK\n\n" + json.toString();
				
				out.write(response.getBytes(Utils.CHARSET));
			}

			@Override
			public JsonValue receive(InputStream in) throws IOException
			{
				Reader r = new InputStreamReader(in);
				int last = 0;
				
				while(true)
				{
					int v = r.read();
					
					if(v == '\r') continue;
					
					System.out.println("Read " + (char) v);
					
					if(v == -1)
						throw new IOException("Unexpected EOS");
					
					if(last == '\n' && v == '\n')
						break;
					
					last = v;
				}
				
				return JsonValue.read(new StreamBuffer(in));
			}
		}, this::handleConnection);
		
		registerAction("query", this::actQuery);
		
		registerMessageHandler(Tasks.Database.DELIVER, this::handleDelivery);
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
	
	private void actQuery(Packet p)
	{
		JsonObject req = (JsonObject) p.content;
		
		String id = req.getString("id");
		long i1 = req.getLong("from"), i2 = req.getLong("to");
		int count = req.getInt("count");
		Interval i = new Interval(id, i1, i2, count);
		
		LOG.log("Frontend requests data from %s (%d)", id, p.id);
		
		getNode().send(Units.DATABASE, new Task(Tasks.Database.RETRIEVE, p.id, i));
	}
	
	private void handleDelivery(Message<Task> p)
	{
		for(Iterator<Entry> i = mConnected.iterator() ; i.hasNext() ;)
		{
			Entry e = i.next();
			
			if(e.id == p.getContent().getSession())
			{
				JsonObject data = p.getContent().getPayload();
				
				LOG.log("Frontend gets data from %s (%d)", data.get("id"), e.id);
				
				try
				{
					e.con.send(data.get("data"));
					e.con.close();
				}
				catch(IOException ex)
				{
					LOG.log(Severity.ERROR, "Failed to report back to frontend: %s", ex.getMessage());
				}
				
				i.remove();
				
				return;
			}
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
