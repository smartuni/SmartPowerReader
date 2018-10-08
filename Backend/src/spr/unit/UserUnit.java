package spr.unit;

import dave.json.PrettyPrinter;
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
	
	@Override
	public void accept(Message<Task> p)
	{
		System.out.println("From " + p.getSender().getID() + " received:");
		System.out.println(p.getContent().save().toString(new PrettyPrinter()));
	}
}
