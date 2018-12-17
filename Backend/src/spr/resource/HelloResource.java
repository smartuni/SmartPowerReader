package spr.resource;

import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.server.resources.CoapExchange;

import dave.json.JsonObject;
import spr.common.Configuration;
import spr.net.common.Gateway;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.ConfigUnit.ConfigData;
import spr.unit.Units;
import spr.util.Converter;

public class HelloResource extends Resource
{
	public HelloResource(Gateway<Task> g)
	{
		super(Resource.HELLO, g);
	}
	
	@Override
	public void handlePOST(CoapExchange e)
	{
		String id = e.getSourceAddress().getHostAddress();
		JsonObject payload = (JsonObject) Converter.toJSON(e.getRequestPayload());
		ConfigData data = new ConfigData(id, Configuration.Data.load(payload));
		
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.NEW, newSession(), data));
		
		e.respond(ResponseCode.VALID);
	}
}
