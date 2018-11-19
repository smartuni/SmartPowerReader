package spr.common;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

import dave.json.Container;
import dave.json.JsonArray;
import dave.json.JsonCollectors;
import dave.json.JsonConstant;
import dave.json.JsonObject;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.json.Loadable;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;
import dave.util.SevereException;

public class Configuration implements Saveable, Loadable
{
	private final Map<String, Entry> mData;
	
	public Configuration( )
	{
		mData = new HashMap<>();
	}
	
	public Stream<Entry> stream( )
	{
		return mData.values().stream();
	}
	
	public Entry get(String ip)
	{
		return mData.get(ip);
	}
	
	public void put(Entry e)
	{
		mData.put(e.ip, e);
	}

	@Override
	public void load(JsonValue json)
	{
		mData.clear();
		
		((JsonArray) json).stream().map(Entry::load).forEach(this::put);
	}

	@Override
	public JsonValue save()
	{
		return mData.entrySet().stream().map(e -> e.getValue().save()).collect(JsonCollectors.ofArray());
	}

	@Container
	public static class Entry implements Saveable
	{
		public final String ip;
		public final String name;
		public final long period;
		public final InetSocketAddress location;
		
		public Entry(String ip, String name, long period, InetSocketAddress location)
		{
			this.ip = ip;
			this.name = name;
			this.period = period;
			this.location = location;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			JsonValue l = JsonConstant.NULL;
			
			if(location != null)
			{
				JsonObject o = new JsonObject();
				
				o.putString("host", location.getHostString());
				o.putInt("port", location.getPort());
				
				l = o;
			}
			
			json.putString("id", ip);
			json.putString("name", name);
			json.putLong("period", period);
			json.put("location", l);
			
			return json;
		}
		
		@Loader
		public static Entry load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String ip = o.getString("id");
			JsonValue name = o.get("name");
			long period = o.getLong("period");
			JsonValue l = o.get("location");
			InetSocketAddress location = null;
			
			if(l != JsonConstant.NULL)
			{
				JsonObject lo = (JsonObject) l;
				
				String host = lo.getString("host");
				int port = lo.getInt("port");
				
				try
				{
					location = new InetSocketAddress(InetAddress.getByName(host), port);
				}
				catch(UnknownHostException e)
				{
					throw new SevereException(e);
				}
			}
			
			return new Entry(ip, name == JsonConstant.NULL ? null : ((JsonString) name).get(), period, location);
		}
		
		@Override
		public String toString( )
		{
			return "Config{" + ip + 
					(name == null ? "" : (" \"" + name + "\"")) + 
					(period <= 0 ? "" : (" " + period + "s")) + 
					(location == null ? "" : (" @" + location.getHostString() + ":" + location.getPort())) + 
				"}";
		}
		
		@Override
		public int hashCode( )
		{
			return (ip.hashCode() * 3) ^ (Objects.hashCode(name) * 13) ^ Long.hashCode(period);
		}
		
		@Override
		public boolean equals(Object o)
		{
			if(o instanceof Entry)
			{
				Entry e = (Entry) o;
				
				return e.ip.equals(ip) && Objects.equals(e.name, name) && e.period == period;
			}
			
			return false;
		}
	}
}
