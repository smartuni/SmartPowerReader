package spr.unit;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import dave.json.Container;
import dave.json.JsonBuilder;
import dave.json.JsonCollectors;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;
import spr.util.persistance.DataPoint;
import spr.util.persistance.Storage;

public class LocalDatabaseUnit extends BaseUnit
{
	private final Function<String, Storage> mCallback;
	private final Map<String, Storage> mDatabase;
	
	public LocalDatabaseUnit(Function<String, Storage> f, Node<Task> g)
	{
		super(g);
		
		mCallback = f;
		mDatabase = new HashMap<>();
		
		registerMessageHandler(Tasks.Database.STORE, this::handleStore);
		registerMessageHandler(Tasks.Database.RETRIEVE, this::handleRetrieve);
		registerMessageHandler(Tasks.Database.DELETE, this::handleDelete);
	}
	
	private void handleStore(Message<Task> p)
	{
		Data d = p.getContent().getPayload();
		
		Storage s = mDatabase.get(d.id);
		
		if(s == null)
		{
			mDatabase.put(d.id, s = mCallback.apply(d.id));
		}
		
		s.store(new DataPoint(d.timestamp, d.value));
	}
	
	private void handleRetrieve(Message<Task> p)
	{
		Interval i = p.getContent().getPayload();
		Storage s = mDatabase.get(i.id);
		
		if(s == null)
		{
			getNode().send(p.getSender(), new Task(p.getContent(), Tasks.Database.UNKNOWN, i.id));
		}
		else
		{
			JsonObject data = new JsonObject();
			
			data.putString("id", i.id);
			data.put("data", s.interval(i.lower, i.upper, i.count).map(LocalDatabaseUnit::toJSON).collect(JsonCollectors.ofArray()));
			
			getNode().send(p.getSender(), new Task(p.getContent(), Tasks.Database.DELIVER, data));
		}
	}
	
	private void handleDelete(Message<Task> p)
	{
		String id = p.getContent().getPayload();
		
		if(mDatabase.remove(id) == null)
		{
			getNode().send(p.getSender(), new Task(p.getContent(), Tasks.Database.UNKNOWN, id));
		}
	}
	
	private static JsonValue toJSON(DataPoint p)
	{
		return (new JsonBuilder()).putLong("timestamp", p.timestamp).putNumber("value", p.value).toJSON();
	}
	
	@Container
	public static class Interval implements Saveable
	{
		public final String id;
		public final long lower, upper;
		public final int count;
		
		public Interval(String id, long lower, long upper, int count)
		{
			this.id = id;
			this.lower = lower;
			this.upper = upper;
			this.count = count;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("id", id);
			json.putLong("lower", lower);
			json.putLong("upper", upper);
			json.putInt("count", count);
			
			return json;
		}
		
		@Loader
		public static Interval load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String id = o.getString("id");
			long lower = o.getLong("lower");
			long upper = o.getLong("upper");
			int count = o.getInt("count");
			
			return new Interval(id, lower, upper, count);
		}
	}
	
	@Container
	public static class Data implements Saveable
	{
		public final String id;
		public final long timestamp;
		public final double value;
		
		public Data(String id, long timestamp, double value)
		{
			this.id = id;
			this.timestamp = timestamp;
			this.value = value;
		}
		
		@Override
		@Saver
		public JsonValue save( )
		{
			JsonObject json = new JsonObject();
			
			json.putString("id", id);
			json.putLong("timestamp", timestamp);
			json.putNumber("value", value);
			
			return json;
		}
		
		@Loader
		public static Data load(JsonValue json)
		{
			JsonObject o = (JsonObject) json;
			
			String id = o.getString("id");
			long timestamp = o.getLong("timestamp");
			double value = o.getDouble("value");
			
			return new Data(id, timestamp, value);
		}
	}
}
