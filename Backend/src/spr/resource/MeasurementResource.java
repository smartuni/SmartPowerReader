package spr.resource;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.sql.Timestamp;

import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.server.resources.CoapExchange;

import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.common.Configuration.Feature;
import spr.net.common.Gateway;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.Units;
import spr.unit.ConfigUnit.StatusReport;
import spr.unit.LocalDatabaseUnit.Data;

public class MeasurementResource extends Resource
{
	private final Feature mFeature;
	
	public MeasurementResource(Feature f, Gateway<Task> g)
	{
		super(Resource.MEASUREMENT, g);
		
		mFeature = f;
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
			ByteBuffer bb = ByteBuffer.wrap(payload); bb.order(ByteOrder.LITTLE_ENDIAN);
			double v = bb.getFloat();
			long t = (new Timestamp(System.currentTimeMillis())).getTime();
			
			com.respond(ResponseCode.VALID);
			
			getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.SET_STATUS, newSession(), new StatusReport(id, mFeature)));
			getNode().send(Units.IDs.DATABASE, new Task(Tasks.Database.STORE, newSession(), new Data(id, t, v)));
		}
	}
}
