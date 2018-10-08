package spr.net;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;

import dave.json.Container;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;
import dave.util.io.SevereIOException;
import spr.net.common.Address;

@Container
public class UniqueAddress implements Address, Saveable
{
	private final String mID;
	private final InetSocketAddress mRemote;
	
	public UniqueAddress(String id, InetSocketAddress r)
	{
		mID = id;
		mRemote = r;
	}
	
	public InetSocketAddress getRemote( ) { return mRemote; }

	@Override
	public String getID()
	{
		return mID;
	}
	
	@Override
	@Saver
	public JsonValue save( )
	{
		JsonObject json = new JsonObject();
		JsonObject remote = new JsonObject();
		
		remote.putString("host", mRemote.getHostString());
		remote.putInt("port", mRemote.getPort());
		
		json.putString("id", mID);
		json.put("remote", remote);
		
		return json;
	}
	
	@Loader
	public static UniqueAddress load(JsonValue json)
	{
		try
		{
			JsonObject o = (JsonObject) json;
			JsonObject r = o.getObject("remote");
			
			String id = o.getString("id");
			InetAddress ip = InetAddress.getByName(r.getString("host"));
			int port = r.getInt("port");
			
			return new UniqueAddress(id, new InetSocketAddress(ip, port));
		}
		catch(UnknownHostException e)
		{
			throw new SevereIOException(e);
		}
	}
	
	@Override
	public int hashCode( )
	{
		return mID.hashCode() ^ (mRemote.hashCode() * 13) ^ 0x23478289;
	}
	
	@Override
	public boolean equals(Object o)
	{
		if(o instanceof UniqueAddress)
		{
			UniqueAddress a = (UniqueAddress) o;
			
			return mID.equals(a.mID) && mRemote.equals(a.mRemote);
		}
		
		return false;
	}
	
	@Override
	public String toString( )
	{
		return String.format("%s@%s:%d", mID, mRemote.getHostString(), mRemote.getPort());
	}
}
