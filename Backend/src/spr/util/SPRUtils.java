package spr.util;

import java.util.Objects;

import dave.json.JsonObject;
import dave.json.JsonValue;

public final class SPRUtils
{
	public static JsonValue substract(JsonValue a, JsonValue b)
	{
		if((a instanceof JsonObject) && (b instanceof JsonObject))
		{
			JsonObject ao = (JsonObject) a;
			JsonObject bo = (JsonObject) b;
			JsonObject r = new JsonObject();
			
			ao.keySet().forEach(key -> {
				if(!bo.keySet().contains(key) || !Objects.equals(ao.get(key), bo.get(key)))
				{
					r.put(key, ao.get(key));
				}
			});
			
			return r;
		}
		else
		{
			return a;
		}
	}
	
	private SPRUtils( ) { }
}
