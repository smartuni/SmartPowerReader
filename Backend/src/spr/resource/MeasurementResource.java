package spr.resource;

import java.nio.ByteBuffer;
import java.sql.Timestamp;

import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.server.resources.CoapExchange;

import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.common.Gateway;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.Units;
import spr.unit.LocalDatabaseUnit.Data;

public class MeasurementResource extends Resource
{
	public MeasurementResource(Gateway<Task> g)
	{
		super(Resource.MEASUREMENT, g);
	}
	
	@Override
	public void handlePUT(CoapExchange com)
	{
		String id = com.getSourceAddress().getHostAddress();
		
		if(com.getRequestPayload() == null)
		{
			Logger.DEFAULT.log(Severity.ERROR, "Client %s send empty payload!", id);
			
			com.respond(ResponseCode.BAD_REQUEST);
		}
		else
		{
			ByteBuffer bb = ByteBuffer.wrap(com.getRequestPayload());
			double v = bb.getDouble();
			long t = (new Timestamp(System.currentTimeMillis())).getTime();
			
			getNode().send(Units.DATABASE, new Task(Tasks.Database.STORE, newSession(), new Data(id, t, v)));
		}
	}
}
