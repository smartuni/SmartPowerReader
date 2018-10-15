package spr.unit;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

import dave.json.JsonString;
import dave.json.JsonValue;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.common.Node;
import spr.net.common.Message;
import spr.task.Task;
import spr.task.Tasks;

public class BaseUnit implements Unit
{
	private final Node<Task> mNode;
	private final Map<String, Consumer<Message<Task>>> mCallbacks;
	private long mSession;
	
	public BaseUnit(Node<Task> g)
	{
		mNode = g;
		mCallbacks = new HashMap<>();
		mSession = 0;

		registerMessageHandler(Tasks.System.STARTUP, m -> onStart());
		registerMessageHandler(Tasks.System.SHUTDOWN, m -> onStop());
		registerMessageHandler(Tasks.System.Status.QUERY, this::handleReport);
	}
	
	public Node<Task> getNode( ) { return mNode; }
	
	protected void onStart( ) { }
	protected void onStop( ) { }
	
	protected long newSession( ) { return mSession++; }
	protected JsonValue getStatus( ) { return new JsonString("present"); }
	
	protected void handleReport(Message<Task> p)
	{
		getNode().send(p.getSender(), new Task(p.getContent(), Tasks.System.Status.INFO, getStatus()));
	}
	
	protected void registerMessageHandler(String task, Consumer<Message<Task>> cb)
	{
		if(mCallbacks.put(task, cb) != null)
			BASE_LOG.log(Severity.INFO, "Overwritten message handler for task '%s'", task);
	}

	@Override
	public void accept(Message<Task> msg)
	{
		Consumer<Message<Task>> cb = mCallbacks.get(msg.getContent().getTask());
		
		if(cb != null)
		{
			cb.accept(msg);
		}
		else
		{
			BASE_LOG.log(Severity.WARNING, "Received message with no registered callback! [%s]", msg);
		}
	}
	
	protected static final Logger BASE_LOG = Logger.get("unit");
}
