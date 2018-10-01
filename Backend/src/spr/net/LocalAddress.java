package spr.net;

import dave.json.Container;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;
import spr.net.common.Address;

@Container
public class LocalAddress implements Address, Saveable
{
	private final String mID;
	
	public LocalAddress(String id)
	{
		mID = id;
	}

	@Override
	public String getID()
	{
		return mID;
	}
	
	@Override
	@Saver
	public JsonValue save( )
	{
		return new JsonString(mID);
	}
	
	@Loader
	public static LocalAddress load(JsonValue json)
	{
		return new LocalAddress(((JsonString) json).get());
	}
	
	@Override
	public int hashCode( )
	{
		return mID.hashCode() ^ 0x12985761;
	}
	
	@Override
	public boolean equals(Object o)
	{
		if(o instanceof LocalAddress)
		{
			LocalAddress a = (LocalAddress) o;
			
			return mID.equals(a.mID);
		}
		
		return false;
	}
	
	@Override
	public String toString( )
	{
		return mID;
	}
}
