package spr.test;

import static org.junit.Assert.*;

import org.junit.Test;

import dave.json.JsonArray;
import dave.json.JsonBuilder;
import dave.json.JsonObject;
import dave.json.JsonValue;
import spr.util.Converter;

public class CborUT
{
	@Test
	public void test( )
	{
		JsonObject json = new JsonObject();
		JsonArray a = new JsonArray();
		
		a.addArray(new double[] { 3, 7, 13, 1337, 69, 420 });
		
		json.putString("hello", "world");
		json.putInt("answer to life", 42);
		json.put("numbers", a);
		json.put("obj", (new JsonBuilder()).putString("abc", "123").putInt("!@#$%^&*()", -1).toJSON());
		
		byte[] cbor = Converter.toCBOR(json);
		JsonValue r = Converter.toJSON(cbor);
		int l = json.keySet().stream().mapToInt(String::length).sum() + 5 + 1 + a.size() * 2 + 3 + 3 + 10 + 1;
		
		assertTrue(cbor.length >= l);
		assertEquals(r, json);
	}
}
