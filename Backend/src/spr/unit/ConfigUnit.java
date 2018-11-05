package spr.unit;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;

import dave.json.JsonConstant;
import dave.json.JsonObject;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.json.JsonBuilder;
import dave.json.JsonCollectors;
import dave.json.PrettyPrinter;
import dave.json.SevereIOException;
import dave.json.StreamBuffer;
import dave.util.Producer;
import dave.util.Utils;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.common.Configuration;
import spr.net.LocalAddress;
import spr.net.UniqueAddress;
import spr.net.common.Address;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.CoapServerUnit.Directive;

public class ConfigUnit extends BaseUnit
{
	private final Configuration mConfig;
	private final Producer<File> mGen;
	private File mLast;
	
	public ConfigUnit(File orig, Producer<File> gen, Node<Task> g)
	{
		super(g);
		
		mConfig = new Configuration();
		mGen = gen;
		
		registerMessageHandler(Tasks.Configuration.NEW, this::handleNew);
		registerMessageHandler(Tasks.Configuration.CONFIGURE, this::handleConfigure);
		registerMessageHandler(Tasks.Configuration.QUERY, this::handleQuery);
		
		if(orig != null)
		{
			try
			{
				mConfig.load(JsonValue.read(new StreamBuffer(new FileInputStream(orig))));
			}
			catch(IOException | SevereIOException | IllegalArgumentException | IllegalStateException e)
			{
				LOG.log(Severity.ERROR, "Failed to load configuration: %s", e.getMessage());
			}
		}
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
			e = new Configuration.Entry(ip, null, 0, location);
		}
		else
		{
			e = new Configuration.Entry(ip, e.name, e.period, location);
		}
		
		updateConfig(e);
	}
	
	private void handleConfigure(Message<Task> p)
	{
		JsonObject json = p.getContent().getPayload();
		
		if(!json.contains("ip"))
		{
			LOG.log(Severity.ERROR, "Received a configuration message without valid IP!");
		}
		else
		{
			Configuration.Entry e = mConfig.get(json.getString("ip"));
			
			if(json.contains("name"))
			{
				JsonValue name = json.get("name");
				
				e = new Configuration.Entry(e.ip, (name == JsonConstant.NULL ? null : ((JsonString) name).get()), e.period, e.location);
			}
			
			if(json.contains("period"))
			{
				long period = json.getLong("period");
				
				e = new Configuration.Entry(e.ip, e.name, period, e.location);
				
				Address coap = new LocalAddress(Units.IDs.COAP);
				
				if(e.location != null)
				{
					coap = new UniqueAddress(Units.IDs.COAP, e.location);
				}
				
				byte[] payload = new byte[4];
				ByteBuffer bb = ByteBuffer.wrap(payload);
				bb.putInt((int) period);
//				byte[] payload = (new JsonBuilder()).putLong("period", period).toJSON().toString().getBytes(Utils.CHARSET);
				CoapServerUnit.Packet packet = new CoapServerUnit.Packet(e.ip, PORT, "config", payload, Directive.PUT);
				
				getNode().send(coap, new Task(Tasks.Coap.SEND, newSession(), packet));
			}
			
			updateConfig(e);
		}
	}
	
	private void handleQuery(Message<Task> p)
	{
		JsonValue json = mConfig.stream().map(Configuration.Entry::save).collect(JsonCollectors.ofArray());
		
		getNode().send(p.getSender(), new Task(p.getContent(), Tasks.Configuration.DELIVER, json));
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
	
	private static final int PORT = 5683;
	
	private static final Logger LOG = Logger.get("measure-u");
}
