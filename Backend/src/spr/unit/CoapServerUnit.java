package spr.unit;

import java.nio.ByteBuffer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.eclipse.californium.core.CoapClient;
import org.eclipse.californium.core.CoapResponse;
import org.eclipse.californium.core.CoapServer;

import dave.json.Container;
import dave.json.JsonArray;
import dave.json.JsonBuilder;
import dave.json.JsonCollectors;
import dave.json.JsonNumber;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;

public class CoapServerUnit extends BaseUnit
{
	private final CoapServer mServer;
	private int mSent;

	public CoapServerUnit(CoapServer s, Node<Task> g)
	{
		super(g);
		
		mServer = s;
		mSent = 0;
		
		registerMessageHandler(Tasks.Coap.SEND, this::handleSend);
	}
	
	@Override
	protected JsonValue getStatus( )
	{
		return (new JsonBuilder()).putInt("sent", mSent).toJSON();
	}
	
	@Override
	protected void onStart( )
	{
		mServer.start();
	}
	
	@Override
	protected void onStop( )
	{
		mServer.stop();
	}
	
	private void handleSend(Message<Task> p)
	{
		Packet msg = p.getContent().getPayload();
		
		CoapClient c = new CoapClient(msg.getURI());
		CoapResponse r = null;
		
		c.setTimeout(TIMEOUT);
		c.useCONs();
		
		switch(msg.action)
		{
			case GET:
				r = c.get();
				break;

			case POST:
				r = c.post(msg.payload, msg.type);
				break;

			case PUT:
				r = c.put(msg.payload, msg.type);
				break;

			case DELETE:
				r = c.delete();
				break;
		}
		
		if(r == null)
		{
			LOG.log(Severity.ERROR, "Coap time-out!");
		}
		else if(!r.isSuccess())
		{
			LOG.log(Severity.ERROR, "Coap request failed: %s", r.getCode().toString());
		}
		else
		{
			++mSent;
		}
	}
	
	@Container
	public static final class Packet implements Saveable
	{
		public final String host;
		public final int port;
		public final String path;
		public final byte[] payload;
		public final Directive action;
		public final int type;
		
		public Packet(String host, int port, String path, byte[] payload, Directive action, int type)
		{
			this.host = host;
			this.port = port;
			this.path = path;
			this.payload = payload;
			this.action = action;
			this.type = type;
		}
		
		public String getURI( ) { return "coap://" + (host.contains(":") ? ("[" + host + "]") : host) + ":" + port + "/" + path; }
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("host", host);
			json.putInt("port", port);
			json.putString("path", path);
			json.put("payload", IntStream.range(0, payload.length).mapToObj(i -> new JsonNumber(payload[i])).collect(JsonCollectors.ofArray()));
			json.putString("action", action.toString());
			json.putInt("type", type);
			
			return json;
		}
		
		@Loader
		public static Packet load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String host = o.getString("host");
			int port = o.getInt("port");
			String path = o.getString("path");
			Directive action = Directive.valueOf(o.getString("action"));
			int type = o.getInt("type");
			
			JsonArray p = o.getArray("payload");
			ByteBuffer bb = ByteBuffer.allocate(p.size());
			
			p.stream().forEach(v -> bb.put((byte) ((JsonNumber) v).getInt()));
			
			byte[] payload = bb.array();
			
			return new Packet(host, port, path, payload, action, type);
		}
		
		@Override
		public String toString( )
		{
			String p = IntStream.range(0, payload.length).mapToObj(i -> String.format("%02X", payload[i])).collect(Collectors.joining(" "));
			
			return getURI() + " " + action + " (" + payload.length + "B): " + p;
		}
	}
	
	public static enum Directive
	{
		GET,
		POST,
		PUT,
		DELETE
	}
	
	private static final int TIMEOUT = 3000;
	private static final Logger LOG = Logger.get("coap-s");
}
