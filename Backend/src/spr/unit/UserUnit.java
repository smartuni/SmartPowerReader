package spr.unit;

import dave.json.JsonArray;
import dave.json.JsonObject;
import dave.json.JsonString;
import dave.json.JsonValue;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.LocalAddress;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;

public class UserUnit extends BaseUnit
{
	private boolean mRunning;
	
	public UserUnit(Node<Task> g)
	{
		super(g);
		
		mRunning = false;

		registerMessageHandler(Tasks.System.Status.QUERY, this::handleStatus);
		
		registerMessageHandler(Tasks.System.Report.STATUS, this::handleInfo);
	}
	
	public boolean isRunning( ) { return mRunning; }
	
	public void execute(String cmd)
	{
		if(cmd.equals("start"))
		{
			mRunning = true;
			
			getNode().send(LocalAddress.BROADCAST, new Task(Tasks.System.STARTUP, newSession()));
		}
		else if(cmd.equals("stop"))
		{
			mRunning = false;
			
			getNode().send(LocalAddress.BROADCAST, new Task(Tasks.System.SHUTDOWN, newSession()));
		}
		else if(cmd.equals("status"))
		{
			getNode().send(Units.SYSTEM, new Task(Tasks.System.Report.REQUEST, newSession()));
		}
		else
		{
			Logger.DEFAULT.log(Severity.WARNING, "Unknown command '%s'!", cmd);
		}
	}
	
	private void handleStatus(Message<Task> p)
	{
		JsonValue status = new JsonString("active");
		
		getNode().send(p.getSender(), new Task(p.getContent(), Tasks.System.Status.INFO, status));
	}
	
	private void handleInfo(Message<Task> p)
	{
		JsonArray status = p.getContent().getPayload();
		
		status.stream().forEach(v -> {
			JsonObject json = (JsonObject) v;
			
			System.out.println(json.getString("id") + ": " + json.get("status"));
		});
	}
}
