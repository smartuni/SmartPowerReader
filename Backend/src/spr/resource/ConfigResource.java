package spr.resource;

import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.server.resources.CoapExchange;

import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.common.Configuration.Data;
import spr.net.common.Gateway;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.ConfigUnit.ConfigData;
import spr.unit.Units;
import spr.util.Converter;

public class ConfigResource extends Resource
{
	public ConfigResource(Gateway<Task> g)
	{
		super(Resource.CONFIG, g);
	}
	
	@Override
	public void handlePUT(CoapExchange ex)
	{
		String id = ex.getSourceAddress().getHostAddress();
		JsonObject json = (JsonObject) Converter.toJSON(ex.getRequestPayload());
		ConfigData config = new ConfigData(id, new Data(json));
		JsonValue packet = config.save();
		
		config.config.stream().filter(f -> !f.isWriteable()).forEach(f -> {
			LOG.log(Severity.WARNING, "Node tried to write read-only property %s!", f.toString());
		});
		
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.CONFIGURE, newSession(), packet));

		ex.respond(ResponseCode.VALID);
	}
	
	private static final Logger LOG = Logger.get("coap-config");
}
