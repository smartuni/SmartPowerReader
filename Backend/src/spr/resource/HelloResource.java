package spr.resource;

import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.server.resources.CoapExchange;

import spr.net.common.Gateway;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.Units;

public class HelloResource extends Resource
{
	public HelloResource(Gateway<Task> g)
	{
		super(Resource.HELLO, g);
	}
	
	@Override
	public void handlePOST(CoapExchange e)
	{
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.NEW, newSession(), e.getSourceAddress().getHostAddress()));
		e.respond(ResponseCode.VALID);
	}
}
