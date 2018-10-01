package spr.task;

import java.util.Objects;

import dave.json.Container;
import dave.json.JSON;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;

@Container
public class Task implements Saveable
{
	private final String mTask;
	private final long mSession;
	private final Object mPayload;
	
	public Task(Task t, String id) { this(id, t.mSession, null); }
	public Task(Task t, String id, Object p) { this(id, t.mSession, p); }
	public Task(String id, long s) { this(id, s, null); }
	public Task(String id, long s, Object p)
	{
		mTask = id;
		mSession = s;
		mPayload = p;
	}
	
	@Override
	public int hashCode( )
	{
		return (mTask.hashCode() * 3) ^ (Long.hashCode(mSession) * 13) ^ Objects.hashCode(mPayload) ^ 0x23784683;
	}
	
	@Override
	public boolean equals(Object o)
	{
		if(o instanceof Task)
		{
			Task t = (Task) o;
			
			return mTask.equals(t.mTask) && mSession == t.mSession && Objects.equals(mPayload, t.mPayload);
		}
		
		return false;
	}
	
	@Override
	public String toString( )
	{
		return String.format("%s[%d %s]", mTask, mSession, mPayload);
	}
	
	@Override
	@Saver
	public JsonValue save( )
	{
		JsonObject json = new JsonObject();
		
		json.putString("task", mTask);
		json.putLong("session", mSession);
		json.put("content", JSON.serialize(mPayload));
		
		return json;
	}
	
	@Loader
	public static Task load(JsonValue json)
	{
		JsonObject o = (JsonObject) json;
		
		String task = o.getString("task");
		long session = o.getLong("session");
		Object payload = JSON.deserialize(o.get("content"));
		
		return new Task(task, session, payload);
	}
}
