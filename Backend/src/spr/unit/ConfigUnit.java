package spr.unit;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import dave.json.JsonConstant;
import dave.json.JsonObject;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Container;
import dave.json.JsonCollectors;
import dave.json.PrettyPrinter;
import dave.json.Saveable;
import dave.json.Saver;
import dave.json.SevereIOException;
import dave.json.StreamBuffer;
import dave.util.Producer;
import dave.util.log.Logger;
import dave.util.log.Severity;
import jacob.CborEncoder;
import spr.common.Configuration;
import spr.common.Configuration.Status;
import spr.net.LocalAddress;
import spr.net.UniqueAddress;
import spr.net.common.Address;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.resource.Resource;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.CoapServerUnit.Directive;

public class ConfigUnit extends BaseUnit
{
	private final Configuration mConfig;
	private final Producer<File> mGen;
	private final Set<String> mOpen;
	private File mLast;
	
	public ConfigUnit(File orig, Producer<File> gen, Node<Task> g)
	{
		super(g);
		
		mConfig = new Configuration();
		mGen = gen;
		mOpen = new HashSet<>();
		
		registerMessageHandler(Tasks.Configuration.NEW, this::handleNew);
		registerMessageHandler(Tasks.Configuration.CONFIGURE, this::handleConfigure);
		registerMessageHandler(Tasks.Configuration.QUERY, this::handleQuery);
		registerMessageHandler(Tasks.Configuration.SET_STATUS, this::handleStatus);
		registerMessageHandler(CALLBACK_ID, this::handleDisconnect);
		
		if(orig != null)
		{
			try
			{
				LOG.log("Read configuration from %s", orig.getName());
				
				mConfig.load(JsonValue.read(new StreamBuffer(new FileInputStream(orig))));
				
				LOG.log("Loaded %d device entries: %s", mConfig.stream().count(), mConfig.stream().map(e -> e.ip).collect(Collectors.joining(", ")));
			}
			catch(IOException | SevereIOException | IllegalArgumentException | IllegalStateException e)
			{
				LOG.log(Severity.ERROR, "Failed to load configuration: %s", e.getMessage());
				e.printStackTrace();
			}
		}
	}
	
	@Override
	protected JsonValue getStatus( )
	{
		JsonObject status = new JsonObject();
		
		if(mLast != null)
		{
			status.putString("file", mLast.getPath());
		}
		
		status.putInt("entries", mConfig.stream().count());
		
		return status;
	}
	
	private void handleNew(Message<Task> p)
	{
		String ip = p.getContent().getPayload();
		Address r = p.getSender();
		InetSocketAddress location = null;
		
		if(r instanceof UniqueAddress)
		{
			location = ((UniqueAddress) r).getRemote();
		}
		
		Configuration.Entry e = mConfig.get(ip);
		
		if(e == null)
		{
			e = new Configuration.Entry(ip, null, 0, location, Status.DISCONNECTED);
		}
		else
		{
			e = e.setIP(ip).setLocation(location);
		}
		
		updateConfig(e);
		
		if(e.period > 0)
		{
			pushConfiguration(e);
		}
	}
	
	private void handleConfigure(Message<Task> p)
	{
		JsonObject json = p.getContent().getPayload();
		
		if(!json.contains("id"))
		{
			LOG.log(Severity.ERROR, "Received a configuration message without valid IP!");
		}
		else
		{
			String id = json.getString("id");
			Configuration.Entry e = mConfig.get(id);
			
			if(e == null)
			{
				LOG.log(Severity.ERROR, "No known device '%s'!", id);
			}
			else
			{
				if(json.contains("name"))
				{
					JsonValue name = json.get("name");
					
					e = e.setName(name == JsonConstant.NULL ? null : ((JsonString) name).get());
				}
				
				if(json.contains("period"))
				{
					long period = json.getLong("period");
					
					e = e.setPeriod(period);
					
					pushConfiguration(e);
				}
				
				updateConfig(e);
			}
		}
	}
	
	private void handleQuery(Message<Task> p)
	{
		JsonValue json = mConfig.stream().map(Configuration.Entry::save).collect(JsonCollectors.ofArray());
		
		getNode().send(p.getSender(), new Task(p.getContent(), Tasks.Configuration.DELIVER, json));
	}
	
	private void handleStatus(Message<Task> p)
	{
		StatusReport rep = p.getContent().getPayload();
		
		Configuration.Entry e = mConfig.get(rep.id);
		
		if(e == null)
		{
			LOG.log(Severity.WARNING, "Trying to set status of unknown device %s!", rep.id);
			
			InetSocketAddress location = null;
			
			if(p.getSender() instanceof UniqueAddress)
			{
				location = ((UniqueAddress) p.getSender()).getRemote();
			}
			
			e = new Configuration.Entry(rep.id, null, 0, location, rep.status);
		}
		else if(e.status != rep.status)
		{
			e = e.setStatus(rep.status);
			
			updateConfig(e);
		}
		
		resetTimer(e);
		
		if(rep.status == Status.CONNECTED)
		{
			setTimer(e);
		}
	}
	
	private void handleDisconnect(Message<Task> p)
	{
		String id = p.getContent().getPayload();
		
		Configuration.Entry e = mConfig.get(id);
		
		if(e == null)
		{
			LOG.log(Severity.WARNING, "Received disconnect timer notification for non-existent node %s", id);
		}
		else
		{
			e = e.setStatus(Status.DISCONNECTED);
			
			updateConfig(e);
		}
	}
	
	private void pushConfiguration(Configuration.Entry e)
	{
		Address coap = new LocalAddress(Units.IDs.COAP);
		
		if(e.location != null)
		{
			coap = new UniqueAddress(Units.IDs.COAP, e.location);
		}
		
		ByteArrayOutputStream payload = new ByteArrayOutputStream();
		try
		{
			CborEncoder cbor = new CborEncoder(payload);
			
			cbor.writeMapStart(1);
			cbor.writeTextString("period");
			cbor.writeInt32(e.period);
		}
		catch(IOException ex)
		{
			throw new SevereIOException(ex);
		}
		
		CoapServerUnit.Packet packet = new CoapServerUnit.Packet(e.ip, PORT, "config", payload.toByteArray(), Directive.PUT, Resource.Format.CBOR);
		
		getNode().send(coap, new Task(Tasks.Coap.SEND, newSession(), packet));
		
		setTimer(e);
	}
	
	private void updateConfig(Configuration.Entry e)
	{
		mConfig.put(e);
		
		File f = mGen.produce();
		
		try(BufferedWriter out = new BufferedWriter(new FileWriter(f)))
		{
			out.write(mConfig.save().toString(new PrettyPrinter()));
		}
		catch(IOException ex)
		{
			LOG.log(Severity.FATAL, "Failed to write config file: %s", ex.getMessage());
		}
		
		if(mLast != null)
		{
			mLast.delete();
		}
		
		mLast = f;
	}

	private void resetTimer(Configuration.Entry e)
	{
		String id = callbackID(e.ip);
		
		if(mOpen.contains(id))
		{
			mOpen.remove(id);
			getNode().send(Units.IDs.TIMER, new Task(Tasks.Timer.Schedule.REMOVE, newSession(), id));
		}
	}
	
	private void setTimer(Configuration.Entry e)
	{
		resetTimer(e);
		
		if(e.period > 0)
		{
			String id = callbackID(e.ip);
			
			getNode().send(Units.IDs.TIMER, new Task(Tasks.Timer.Schedule.ONE_SHOT, newSession(), 
					new TimerUnit.FutureTask(id, new Task(CALLBACK_ID, 0, e.ip), (int) (e.period * 3 / 2))));
			mOpen.add(id);
		}
	}
	
	private String callbackID(String id) { return CALLBACK_ID + "_" + id; }
	
	@Container
	public static final class StatusReport implements Saveable
	{
		public final String id;
		public final Status status;
		
		public StatusReport(String id, Status status)
		{
			this.id = id;
			this.status = status;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("id", id);
			json.putString("status", status.toString());
			
			return json;
		}
		
		@Loader
		public static StatusReport load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String id = o.getString("id");
			Status status = Status.valueOf(o.getString("status"));
			
			return new StatusReport(id, status);
		}
		
		@Override
		public String toString( )
		{
			return id + ": " + status.toString();
		}
	}
	
	private static final int PORT = 5683;
	private static final String CALLBACK_ID = "disconnect";
	
	private static final Logger LOG = Logger.get("db-u");
}
