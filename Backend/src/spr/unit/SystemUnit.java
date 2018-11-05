package spr.unit;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

import dave.json.JsonBuilder;
import dave.json.JsonCollectors;
import dave.json.JsonObject;
import dave.json.JsonValue;

import spr.net.LocalAddress;
import spr.net.common.Node;
import spr.net.common.Message;
import spr.task.Task;
import spr.task.Tasks;

public class SystemUnit extends BaseUnit
{
	private final Map<String, JsonValue> mStati;
	
	public SystemUnit(Node<Task> g)
	{
		super(g);
		
		mStati = new HashMap<>();

		registerMessageHandler(Tasks.System.Report.REQUEST, this::handleStatusRequest);
		
		registerMessageHandler(Tasks.System.Status.INFO, this::handleStatusInfo);
		registerMessageHandler(TASK_TRIGGER_QUERY, this::handleTrigger);
	}

	@Override
	protected void onStart( )
	{
		getNode().send(Units.IDs.TIMER,
			new Task(Tasks.Timer.Schedule.PERIODIC, newSession(),
				new TimerUnit.FutureTask(FUTURE_ID,
					new Task(TASK_TRIGGER_QUERY, newSession()), QUERY_DELTA)));
		
		queryStatus();
	}
	
	@Override
	protected JsonValue getStatus( )
	{
		return (new JsonBuilder()).putInt("count", mStati.size()).toJSON();
	}
	
	private void handleStatusRequest(Message<Task> p)
	{
		JsonValue status = mStati.values().stream().collect(JsonCollectors.ofArray());
		
		getNode().send(p.getSender(), new Task(p.getContent(), Tasks.System.Report.STATUS, status));
	}
	
	private void handleStatusInfo(Message<Task> p)
	{
		String id = p.getSender().getID();
		JsonObject json = new JsonObject();
		
		json.putString("id", id);
		json.putLong("time", (new Timestamp(System.currentTimeMillis())).getTime());
		json.put("status", p.getContent().getPayload());
		
		mStati.put(id, json);
	}
	
	private void handleTrigger(Message<Task> p)
	{
		queryStatus();
	}
	
	private void queryStatus( )
	{
		getNode().send(LocalAddress.BROADCAST, new Task(Tasks.System.Status.QUERY, newSession()));
	}
	
	private static final String FUTURE_ID = "prompt-solicitation";
	private static final String TASK_TRIGGER_QUERY = "solicit-status";
	private static final int QUERY_DELTA = 5 * 60;
}
