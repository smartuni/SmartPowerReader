package spr.unit;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import dave.json.JsonConstant;
import dave.json.JsonNumber;
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
import spr.common.Configuration;
import spr.common.Configuration.Data;
import spr.common.Configuration.Feature;
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
import spr.util.AbstractWatchdog;
import spr.util.Converter;
import spr.util.SPRUtils;
import spr.util.Watchdog;

public class ConfigUnit extends BaseUnit
{
	private final Configuration mConfig;
	private final Producer<File> mGen;
	private final Watchdog mWatchdog;
	private File mLast;
	
	public ConfigUnit(File orig, Producer<File> gen, Node<Task> g)
	{
		super(g);
		
		NetWatchdog wd = new NetWatchdog();
		
		mConfig = new Configuration();
		mGen = gen;
		mWatchdog = wd;
		
		registerMessageHandler(Tasks.Configuration.NEW, this::handleNew);
		registerMessageHandler(Tasks.Configuration.CONFIGURE, this::handleConfigure);
		registerMessageHandler(Tasks.Configuration.QUERY, this::handleQuery);
		registerMessageHandler(Tasks.Configuration.SET_STATUS, this::handleStatus);
		registerMessageHandler(CALLBACK_ID, p -> wd.callback(p.getContent().getPayload()));
		
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
		ConfigData c = p.getContent().getPayload();
		Address r = p.getSender();
		InetSocketAddress location = null;
		
		if(r instanceof UniqueAddress)
		{
			location = ((UniqueAddress) r).getRemote();
		}
		
		Configuration.Entry e = mConfig.get(c.id);
		
		if(e == null)
		{
			e = new Configuration.Entry(c.id, null, location, Status.DISCONNECTED, c.config);
		}
		else
		{
			Map<Feature, JsonValue> data = new HashMap<>();
			final Configuration.Data old = e.data;
			
			c.config.stream().forEach(f -> {
				if(f.isWriteable() || !old.hasFeature(f))
				{
					data.put(f, c.config.get(f));
				}
				else
				{
					data.put(f, old.get(f));
				}
			});
			
			e = new Configuration.Entry(c.id, e.name, location, Status.CONNECTED, new Configuration.Data(data));
		}
		
		updateConfig(e);
		pushConfiguration(e);
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
				
				if(json.contains("data"))
				{
					e = e.addData(new Data(json.getObject("data")));
					
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
			LOG.log(Severity.ERROR, "Trying to set status of unknown device %s!", rep.id);
		}
		else
		{
			if(e.status != Status.CONNECTED)
			{
				e = e.setStatus(Status.CONNECTED);
				
				updateConfig(e);
			}
			
			if(e.status == Status.CONNECTED)
			{
				setTimer(e, rep.feature);
			}
		}
	}

// ----------------------------------------------------------------------------------------------------	
	
	private JsonValue generateConfig(Configuration.Entry e)
	{
		Map<String, JsonObject> mCache = new HashMap<>();
		
		JsonObject o = mCache.get(e.ip);
		JsonObject n = e.data.stream()
			.filter(f -> !f.isWriteable())
			.collect(JsonCollectors.ofObject((json, f) -> json.put(f.toString(), e.data.get(f))));
		
		if(o != null)
		{
			n = (JsonObject) SPRUtils.substract(n, o);
		}
		
		if(n.keySet().isEmpty())
		{
			n = null;
			
			mCache.remove(e.ip);
		}
		else
		{
			mCache.put(e.ip, n);
		}
		
		return n;
	}
	
	private void pushConfiguration(Configuration.Entry e)
	{
		JsonValue data = generateConfig(e);
		
		if(data != null)
		{
			Address coap = new LocalAddress(Units.IDs.COAP);
			byte[] payload = Converter.toCBOR(data);
			CoapServerUnit.Packet packet = new CoapServerUnit.Packet(e.ip, PORT, "config", payload, Directive.PUT, Resource.Format.CBOR);
			
			if(e.location != null)
			{
				coap = new UniqueAddress(Units.IDs.COAP, e.location);
			}
			
			getNode().send(coap, new Task(Tasks.Coap.SEND, newSession(), packet));
			
			e.data.stream().filter(Feature::isCounter).forEach(f -> setTimer(e, f));
		}
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

	private void setTimer(Configuration.Entry e, Configuration.Feature f)
	{
		int p = ((JsonNumber) e.data.get(f)).getInt();

		mWatchdog.reset(e.ip + SEP + f, System.currentTimeMillis() + 1500 * p);
	}
	
	@Container
	public static final class ConfigData implements Saveable
	{
		public final String id;
		public final Data config;
		
		public ConfigData(String id, Data config)
		{
			this.id = id;
			this.config = config;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("id", id);
			json.put("data", config.save());
			
			return json;
		}
		
		@Loader
		public static ConfigData load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String id = o.getString("id");
			Data config = Data.load(o.get("data"));
			
			return new ConfigData(id, config);
		}
		
		@Override
		public String toString( )
		{
			return "ConfigData[" + id + " " + config + "]";
		}
	}
	
	@Container
	public static final class StatusReport implements Saveable
	{
		public final String id;
		public final Configuration.Feature feature;
		
		public StatusReport(String id, Configuration.Feature feature)
		{
			this.id = id;
			this.feature = feature;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("id", id);
			json.putString("feature", feature.toString());
			
			return json;
		}
		
		@Loader
		public static StatusReport load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String id = o.getString("id");
			Configuration.Feature feature = Configuration.Feature.valueOf(o.getString("feature").toUpperCase());
			
			return new StatusReport(id, feature);
		}
		
		@Override
		public String toString( )
		{
			return id + ": " + feature.toString();
		}
	}
	
	private class NetWatchdog extends AbstractWatchdog
	{
		@Override
		protected void trigger(String id)
		{
			String ip = id.substring(0, id.indexOf(SEP));
			Configuration.Entry e = mConfig.get(ip);
			
			if(e == null)
			{
				LOG.log(Severity.WARNING, "Timeout for unknown device %s!", ip);
			}
			else
			{
				if(e.status != Status.DISCONNECTED)
				{
					e = e.setStatus(Status.DISCONNECTED);
					
					updateConfig(e);
				}
			}
		}

		@Override
		protected void schedule(String id, long ms)
		{
			long now = System.currentTimeMillis();
			String tid = CALLBACK_ID + "_" + id;
			
			if(ms > now)
			{
				int t = (int) (((ms - now) + 999) / 1000);
				
				getNode().send(Units.IDs.TIMER, new Task(Tasks.Timer.Schedule.ONE_SHOT, newSession(),
					new TimerUnit.FutureTask(tid, new Task(CALLBACK_ID, 0, id), t)));
			}
			else
			{
				getNode().send(Units.IDs.TIMER,  new Task(Tasks.Timer.Schedule.REMOVE, newSession(), tid));
			}
		}
	}
	
	private static final int PORT = 5683;
	private static final String CALLBACK_ID = "disconnect";
	private static final String SEP = "~";
	
	private static final Logger LOG = Logger.get("db-u");
}
