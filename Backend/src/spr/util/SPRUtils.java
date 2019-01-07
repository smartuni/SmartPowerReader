package spr.util;

import java.util.Objects;

import dave.json.JsonObject;
import dave.json.JsonValue;

public final class SPRUtils
{
	public static JsonValue subtract(JsonValue a, JsonValue b)
	{
		if((a instanceof JsonObject) && (b instanceof JsonObject))
		{
			JsonObject ao = (JsonObject) a;
			JsonObject bo = (JsonObject) b;
			JsonObject r = new JsonObject();
			
			ao.keySet().forEach(key -> {
				JsonValue va = ao.get(key);
				JsonValue vb = (bo.contains(key) ? bo.get(key) : null);
				
				if(vb == null || !Objects.equals(va, vb))
				{
					r.put(key, subtract(va, vb));
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
