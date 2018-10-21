package spr.resource;

import java.nio.ByteBuffer;
import java.sql.Timestamp;

import org.eclipse.californium.core.server.resources.CoapExchange;

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
	public void handlePOST(CoapExchange com)
	{
		String id = com.getSourceAddress().getHostAddress();
		ByteBuffer bb = ByteBuffer.wrap(com.getRequestPayload());
		double v = bb.getDouble();
		long t = (new Timestamp(System.currentTimeMillis())).getTime();
		
		getNode().send(Units.DATABASE, new Task(Tasks.Database.STORE, newSession(), new Data(id, t, v)));
	}
}
