package spr.resource;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.sql.Timestamp;

import org.eclipse.californium.core.CoapClient;
import org.eclipse.californium.core.CoapResponse;
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
			byte[] payload = com.getRequestPayload();
			
			Logger.DEFAULT.log(Severity.INFO, "%02x %02x %02x %02x", payload[0], payload[1], payload[2], payload[3]);
			
			ByteBuffer bb = ByteBuffer.wrap(payload); bb.order(ByteOrder.LITTLE_ENDIAN);
			double v = bb.getFloat();
			long t = (new Timestamp(System.currentTimeMillis())).getTime();
			
			com.accept();
			
			getNode().send(Units.DATABASE, new Task(Tasks.Database.STORE, newSession(), new Data(id, t, v)));
			
			CoapClient remote = new CoapClient("coap://" + id + ":" + com.getSourcePort() + "/value");
			CoapResponse r = remote.put("Hello, World!", 0);
			
			Logger.DEFAULT.log(Severity.INFO, "%s responds %s", id, r.getCode().toString());
		}
	}
}
