package spr.unit;

import java.sql.Timestamp;
import java.util.Date;

import dave.json.JsonArray;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.StringBuffer;
import dave.util.command.Argument.Type;
import dave.util.command.CommandBuilder;
import dave.util.command.Engine;
import dave.util.command.ParseException;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.LocalAddress;
import spr.client.SimpleCommand;
import spr.common.Configuration;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;
import spr.unit.LocalDatabaseUnit.Data;

public class UserUnit extends BaseUnit
{
	private static interface RemoteCommand { void execute(String ip, int port); }
	private static interface ActionCommand { void execute(String to, String json); }
	
	private final Engine mCommands;
	private boolean mRunning;
	
	public UserUnit(Node<Task> g)
	{
		super(g);
		
		mCommands = new Engine(System.out);
		mRunning = false;

		mCommands.add(new SimpleCommand("start", "broadcasts 'start' message", this::runStart));
		mCommands.add(new SimpleCommand("stop", "broadcasts 'stop' message", this::runStop));
		mCommands.add(new SimpleCommand("status", "collects system status", this::runStatus));
		mCommands.add(new SimpleCommand("help", "lists all commands with info", this::runHelp));
		mCommands.add(new SimpleCommand("generate", "generates example data", this::runGenerate));
		mCommands.add((new CommandBuilder<ActionCommand>("send", "sends a packet", this::runAction)
				.add("to", Type.STRING)
				.add("data", Type.STRING)
				.build()));
		mCommands.add((new CommandBuilder<RemoteCommand>("remote", "connects to remote and sends status request", this::runRemote)
				.add("ip", Type.STRING)
				.add("port", Type.INT)
				.build()));

		registerMessageHandler(Tasks.System.Report.STATUS, this::handleInfo);
	}
	
	public boolean isRunning( ) { return mRunning; }
	
	private void runGenerate( )
	{
		String id = "test-123";
		long now = (new Timestamp(System.currentTimeMillis())).getTime();
		double value = 1000;
		
		System.out.println("Generating 100 datapoints for " + id + " starting @" + (new Date()).toString() + " with 1h distance");
		
		getNode().send(Units.IDs.CONFIG, new Task(Tasks.Configuration.NEW, newSession(), new ConfigUnit.ConfigData(id, new Configuration.Data(new Configuration.Feature[] { Configuration.Feature.PWR_PERIOD, Configuration.Feature.SWITCH_STATE }))));
		
		for(int i = 0 ; i < 100 ; ++i)
		{
			getNode().send(Units.IDs.DATABASE, new Task(Tasks.Database.STORE, newSession(), new Data(id, now, value)));
			
			value += Math.random();
			now += 1 * 60 * 60 * 1000;
		}
	}
	
	private void runRemote(String ip, int port)
	{
	}
	
	private void runStart( )
	{
		mRunning = true;
		
		mCommands.printf("Starting system ...\n");
		
		getNode().send(LocalAddress.BROADCAST, new Task(Tasks.System.STARTUP, newSession()));
	}
	
	private void runStop( )
	{
		mRunning = false;

		mCommands.printf("Shutting down ...\n");
		
		getNode().send(LocalAddress.BROADCAST, new Task(Tasks.System.SHUTDOWN, newSession()));
	}
	
	private void runStatus( )
	{
		getNode().send(Units.IDs.SYSTEM, new Task(Tasks.System.Report.REQUEST, newSession()));
	}
	
	private void runHelp( )
	{
		mCommands.forEach(cmd -> {
			mCommands.printf("%10s | %s\n", cmd.getID(), cmd.help());
		});
	}
	
	private void runAction(String to, String json)
	{
		try
		{
			getNode().send(to, Task.load(JsonValue.read(new StringBuffer(json))));
		}
		catch(Throwable e)
		{
			e.printStackTrace();
			
			Logger.DEFAULT.log(Severity.ERROR, "Failed to send: %s!", e.getMessage());
		}
	}
	
	public void execute(String cmd)
	{
		try
		{
			mCommands.run(cmd);
		}
		catch (ParseException e)
		{
			System.out.println("Execution error: " + e.getMessage());
			Logger.DEFAULT.log(Severity.WARNING, "Command exec error: %s!", e.getMessage());
		}
	}
	
	private void handleInfo(Message<Task> p)
	{
		JsonArray status = p.getContent().getPayload();
		
		status.stream().forEach(v -> {
			JsonObject json = (JsonObject) v;
			
			mCommands.printf("%s: %s\n", json.getString("id"), json.get("status").toString());
		});
	}
}
