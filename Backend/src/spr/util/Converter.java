package spr.util;

import dave.json.JsonArray;
import dave.json.JsonConstant;
import dave.json.JsonNumber;
import dave.json.JsonObject;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.util.SevereException;
import jacob.CborDecoder;
import jacob.CborEncoder;
import jacob.CborType;

import static jacob.CborConstants.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public final class Converter
{
	public static JsonValue toJSON(byte[] cbor)
	{
		try
		{
			return readNext(new CborDecoder(new ByteArrayInputStream(cbor)));
		}
		catch(IOException e)
		{
			throw new SevereException(e);
		}
	}
	
	public static byte[] toCBOR(JsonValue json)
	{
		ByteArrayOutputStream cbor = new ByteArrayOutputStream();
		
		try
		{
			writeNext(new CborEncoder(cbor), json);
		}
		catch(IOException e)
		{
			throw new SevereException(e);
		}
		
		return cbor.toByteArray();
	}
	
	private static JsonValue readNext(CborDecoder cbor) throws IOException
	{
		CborType t = cbor.peekType();
		
		switch(t.getMajorType())
		{
			case TYPE_UNSIGNED_INTEGER:
			case TYPE_NEGATIVE_INTEGER:
				return new JsonNumber(cbor.readInt());
				
			case TYPE_BYTE_STRING:
				return new JsonString(new String(cbor.readByteString()));
				
			case TYPE_TEXT_STRING:
				return new JsonString(cbor.readTextString());
				
			case TYPE_TAG:
				return new JsonNumber(cbor.readTag());
				
			case TYPE_FLOAT_SIMPLE:
				switch(t.getAdditionalInfo())
				{
					case TRUE:
					case FALSE:
						return cbor.readBoolean() ? JsonConstant.TRUE : JsonConstant.FALSE;
						
					case NULL:
						cbor.readNull();
						return JsonConstant.NULL;
						
					case UNDEFINED:
						cbor.readUndefined();
						return JsonConstant.NULL;
						
					case BREAK:
						cbor.readBreak();
						return JsonConstant.NULL;
						
					case ONE_BYTE:
						return new JsonNumber(cbor.readSimpleValue());
						
					case HALF_PRECISION_FLOAT:
						return new JsonNumber(cbor.readHalfPrecisionFloat());
						
					case SINGLE_PRECISION_FLOAT:
						return new JsonNumber(cbor.readFloat());
						
					case DOUBLE_PRECISION_FLOAT:
						return new JsonNumber(cbor.readDouble());
				}
				
			case TYPE_ARRAY:
			{
				JsonArray json = new JsonArray();
				int l = (int) cbor.readArrayLength();

				for(int i = 0 ; i < l || l < 0 ; ++i)
				{
					JsonValue v = readNext(cbor);
					
					if(l < 0 && v == null) break;
					
					json.add(v);
				}
				
				return json;
			}
			
			case TYPE_MAP:
			{
				JsonObject json = new JsonObject();
				int l = (int) cbor.readMapLength();
				
				for(int i = 0 ; i < l || l < 0 ; ++i)
				{
					JsonString key = (JsonString) readNext(cbor);
					
					if(l < 0 && key == null) break;
					
					JsonValue v = readNext(cbor);
					
					json.put(key.get(), v);
				}
				
				return json;
			}
		}
		
		return null;
	}
	
	private static void writeNext(CborEncoder cbor, JsonValue json) throws IOException
	{
		if(json instanceof JsonConstant)
		{
			if(json == JsonConstant.TRUE || json == JsonConstant.FALSE)
			{
				cbor.writeBoolean(json == JsonConstant.TRUE);
			}
			else if(json == JsonConstant.NULL)
			{
				cbor.writeNull();
			}
		}
		else if(json instanceof JsonNumber)
		{
			JsonNumber n = (JsonNumber) json;
			
			if(n.isInt())
			{
				cbor.writeInt(n.getLong());
			}
			else
			{
				cbor.writeDouble(n.getDouble());
			}
		}
		else if(json instanceof JsonString)
		{
			cbor.writeTextString(((JsonString) json).get());
		}
		else if(json instanceof JsonArray)
		{
			JsonArray a = (JsonArray) json;
			
			cbor.writeArrayStart(a.size());
			for(JsonValue v : a)
			{
				writeNext(cbor, v);
			}
		}
		else if(json instanceof JsonObject)
		{
			JsonObject o = (JsonObject) json;
			
			cbor.writeMapStart(o.keySet().size());
			for(String key : o.keySet())
			{
				cbor.writeTextString(key);
				writeNext(cbor, o.get(key));
			}
		}
	}
	
	private Converter( ) { }
}
