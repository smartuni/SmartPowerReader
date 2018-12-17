package spr.common;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import dave.json.Container;
import dave.json.JsonArray;
import dave.json.JsonNumber;
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

	public static enum Status
	{
		CONNECTED,
		DISCONNECTED
	}
	
	public static enum Feature
	{
		SWITCH_STATE(JsonConstant.TRUE, false, false),
		MANUAL(JsonConstant.FALSE, true, false),
		ESTOP(JsonConstant.FALSE, true, false),
		PWR_PERIOD(new JsonNumber(0), false, true);
		
		private final JsonValue mDefault;
		private final boolean mCounter;
		private final boolean mWriteable;
		
		private Feature(JsonValue def, boolean writeable, boolean counter)
		{
			mDefault = def;
			mWriteable = writeable;
			mCounter = counter;
		}
		
		public JsonValue getDefault( ) { return mDefault; }
		public boolean isCounter( ) { return mCounter; }
		public boolean isWriteable( ) { return mWriteable; }
	}
	
	@Container
	public static class Data implements Saveable
	{
		private final Feature[] mFeatures;
		private final JsonValue[] mValues;
		
		public Data(Feature[] features)
		{
			if(features == null || Stream.of(features).anyMatch(o -> o == null))
				throw new NullPointerException();
			if(Stream.of(features).distinct().count() != features.length)
				throw new IllegalArgumentException();
			
			mFeatures = Arrays.copyOf(features, features.length);
			mValues = new JsonValue[features.length];
			
			for(int i = 0 ; i < mFeatures.length ; ++i)
			{
				mValues[i] = mFeatures[i].getDefault();
			}
		}
		
		public Data(Map<Feature, JsonValue> s)
		{
			mFeatures = s.keySet().toArray(new Feature[s.size()]);
			mValues = new JsonValue[mFeatures.length];
			
			for(int i = 0 ; i < mFeatures.length ; ++i)
			{
				JsonValue v = s.get(mFeatures[i]);
				
				if(v == null)
					v = mFeatures[i].getDefault();
				
				mValues[i] = v;
			}
		}
		
		public Data(JsonObject json)
		{
			this(json.keySet().stream().collect(Collectors.toMap(key -> Feature.valueOf(key.toUpperCase()), key -> json.get(key))));
		}
		
		private Data(Data d)
		{
			mFeatures = Arrays.copyOf(d.mFeatures, d.mFeatures.length);
			mValues = Arrays.copyOf(d.mValues, d.mValues.length);
		}
		
		public int size( ) { return mFeatures.length; }
		public Feature get(int i) { return mFeatures[i]; }
		public boolean hasFeature(Feature f) { return Stream.of(mFeatures).anyMatch(f::equals); }
		public JsonValue get(Feature f)
		{
			for(int i = 0 ; i < mFeatures.length ; ++i)
			{
				if(mFeatures[i] == f)
					return mValues[i];
			}
			
			throw new NoSuchElementException(f.toString());
		}
		
		public Data merge(Data d)
		{
			Data o = clone();
			
			for(int i = 0 ; i < d.mFeatures.length ; ++i)
			{
				Feature f = d.mFeatures[i];
				
				o = o.set(f, d.get(f));
			}
			
			return o;
		}
		
		@Override
		public Data clone( )
		{
			return new Data(this);
		}
		
		public Data set(Feature f, JsonValue v)
		{
			if(v == null)
				throw new NullPointerException(f.toString());
			
			Data e = new Data(mFeatures);
			
			boolean found = false;
			for(int i = 0 ; i < mFeatures.length ; ++i)
			{
				boolean now = mFeatures[i] == f;
				
				e.mValues[i] = now ? v : mValues[i];
				found = (found || now);
			}
			
			if(!found)
				throw new IllegalArgumentException(f.toString());
			
			return e;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			for(int i = 0 ; i < mFeatures.length ; ++i)
			{
				json.put(mFeatures[i].toString(), mValues[i]);
			}
			
			return json;
		}
		
		@Loader
		public static Data load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			Map<Feature, JsonValue> m = new LinkedHashMap<>();
			
			o.keySet().forEach(key -> {
				m.put(Feature.valueOf(key.toUpperCase()), o.get(key));
			});
			
			return new Data(m);
		}
		
		public Stream<Feature> stream( ) { return Stream.of(mFeatures); }
	}
	
	@Container
	public static class Entry implements Saveable
	{
		public final String ip;
		public final String name;
		public final InetSocketAddress location;
		public final Status status;
		public final Data data;
		
		public Entry(String ip, String name, InetSocketAddress location, Status status, Data data)
		{
			this.ip = ip;
			this.name = name;
			this.location = location;
			this.status = status;
			this.data = data;
		}
		
		public Entry setIP(String ip) { return new Entry(ip, name, location, status, data); }
		public Entry setName(String name) { return new Entry(ip, name, location, status, data); }
		public Entry setLocation(InetSocketAddress location) { return new Entry(ip, name, location, status, data); }
		public Entry setStatus(Status status) { return new Entry(ip, name, location, status, data); }
		public Entry setData(Feature f, JsonValue v) { return new Entry(ip, name, location, status, data.set(f, v)); }
		public Entry addData(Data d) { return new Entry(ip, name, location, status, data.merge(d)); }
		
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
			json.put("location", l);
			json.putString("status", status.toString());
			json.put("data", data.save());
			
			return json;
		}
		
		@Loader
		public static Entry load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String ip = o.getString("id");
			JsonValue name = o.get("name");
			JsonValue l = o.get("location");
			Data data = Data.load(o.get("data"));
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
			
			return new Entry(ip, name == JsonConstant.NULL ? null : ((JsonString) name).get(), location, Status.DISCONNECTED, data);
		}
		
		@Override
		public String toString( )
		{
			return "Config{" + ip + 
					(name == null ? "" : (" \"" + name + "\"")) + 
					(location == null ? "" : (" @" + location.getHostString() + ":" + location.getPort())) + 
				"}";
		}
		
		@Override
		public int hashCode( )
		{
			return (ip.hashCode() * 3) ^ (Objects.hashCode(name) * 13) ^ data.hashCode();
		}
		
		@Override
		public boolean equals(Object o)
		{
			if(o instanceof Entry)
			{
				Entry e = (Entry) o;
				
				return e.ip.equals(ip) && Objects.equals(e.name, name) && e.data.equals(data);
			}
			
			return false;
		}
	}
}
