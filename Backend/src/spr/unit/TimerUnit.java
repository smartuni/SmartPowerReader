package spr.unit;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import dave.json.JsonBuilder;
import dave.json.JsonValue;
import spr.net.common.Address;
import spr.net.common.Node;
import spr.net.common.Message;
import spr.task.Task;
import spr.task.Tasks;

public class TimerUnit extends BaseUnit
{
	private final ScheduledExecutorService mAsync;
	private final Set<String> mBacklog;
	private final Map<String, Future<?>> mRefs;
	
	public TimerUnit(Node<Task> g)
	{
		super(g);
		
		mAsync = Executors.newSingleThreadScheduledExecutor();
		mBacklog = ConcurrentHashMap.newKeySet();
		mRefs = new HashMap<>();
		
		registerMessageHandler(Tasks.Timer.Schedule.PERIODIC, this::handleSchedulePeriodic);
		registerMessageHandler(Tasks.Timer.Schedule.ONE_SHOT, this::handleScheduleOneshot);
		registerMessageHandler(Tasks.Timer.Schedule.REMOVE, this::handleScheduleRemove);
	}
	
	@Override
	protected void onStop( )
	{
		mAsync.shutdownNow();
	}
	
	@Override
	protected JsonValue getStatus( )
	{
		return (new JsonBuilder()).putInt("size", mBacklog.size()).toJSON();
	}

	private void handleSchedulePeriodic(Message<Task> p)
	{
		FutureTask f = p.getContent().getPayload();
		String id = p.getSender().getID() + "." + f.id;
		Future<?> cb = mAsync.scheduleAtFixedRate(() -> send(p.getSender(), f, true), f.time, f.time, TimeUnit.SECONDS);
		
		add(id, cb);
	}
	
	private void handleScheduleOneshot(Message<Task> p)
	{
		FutureTask f = p.getContent().getPayload();
		String id = p.getSender().getID() + "." + f.id;
		Future<?> cb = mAsync.schedule(() -> send(p.getSender(), f, false), f.time, TimeUnit.SECONDS);
		
		add(id, cb);
	}
	
	private void handleScheduleRemove(Message<Task> p)
	{
		remove(p.getSender().getID() + "." + p.getContent().getPayload());
	}
	
	private void remove(String id)
	{
		mBacklog.remove(id);
		
		Future<?> f = mRefs.remove(id);
		
		if(f != null)
		{
			f.cancel(false);
		}
	}
	
	private void add(String id, Future<?> f)
	{
		remove(id);
		
		mBacklog.add(id);
		mRefs.put(id, f);
	}
	
	private void send(Address to, FutureTask f, boolean recurring)
	{
		String id = to.getID() + "." + f.id;
		
		if(mBacklog.contains(id))
		{
			if(!recurring)
			{
				mBacklog.remove(id);
			}
			
			getNode().send(to, f.task);
		}
	}
	
	public static class FutureTask
	{
		public final String id;
		public final Task task;
		public final int time;
		
		public FutureTask(String id, Task task, int time)
		{
			this.id = id;
			this.task = task;
			this.time = time;
		}
		
		@Override
		public String toString( )
		{
			return String.format("future.%s(%s@%d)", id, task, time);
		}
	}
}
