package spr.unit;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
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
	
	public TimerUnit(Node<Task> g)
	{
		super(g);
		
		mAsync = Executors.newSingleThreadScheduledExecutor();
		mBacklog = ConcurrentHashMap.newKeySet();
		
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
		
		mBacklog.add(id);
		
		mAsync.scheduleAtFixedRate(() -> send(p.getSender(), f), f.time, f.time, TimeUnit.SECONDS);
	}
	
	private void handleScheduleOneshot(Message<Task> p)
	{
		FutureTask f = p.getContent().getPayload();
		String id = p.getSender().getID() + "." + f.id;
		
		mBacklog.add(id);
		
		mAsync.schedule(() -> send(p.getSender(), f), f.time, TimeUnit.SECONDS);
	}
	
	private void handleScheduleRemove(Message<Task> p)
	{
		mBacklog.remove(p.getSender().getID() + "." + p.getContent().getPayload());
	}
	
	private void send(Address to, FutureTask f)
	{
		String id = to.getID() + "." + f.id;
		
		if(mBacklog.contains(id))
		{
			mBacklog.remove(id);
			
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
