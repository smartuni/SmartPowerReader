package spr.unit;

import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.sql.Timestamp;
import java.util.Date;

import dave.json.JsonArray;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.PrettyPrinter;
import dave.net.server.Connection;
import dave.net.server.TCPConnection;
import dave.util.command.Argument.Type;
import dave.util.command.CommandBuilder;
import dave.util.command.Engine;
import dave.util.command.ParseException;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.net.LocalAddress;
import spr.client.SimpleCommand;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;
import spr.task.Tasks;
import spr.util.persistance.DataPoint;

public class UserUnit extends BaseUnit
{
	private static interface RemoteCommand { void execute(String ip, int port); }
	
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
		mCommands.add((new CommandBuilder<RemoteCommand>("remote", "connects to remote and sends status request", this::runRemote)
				.add("ip", Type.STRING)
				.add("port", Type.INT)
				.build()));

		registerMessageHandler(Tasks.System.Report.STATUS, this::handleInfo);
	}
	
	public boolean isRunning( ) { return mRunning; }
	
	private void runGenerate( )
	{
		long now = (new Timestamp(System.currentTimeMillis())).getTime();
		double value = 1000;
		
		System.out.println("Generating 1000 datapoints starting @" + (new Date()).toString() + " with 1h distance");
		
		for(int i = 0 ; i < 1000 ; ++i)
		{
			getNode().send(Units.DATABASE, new Task(Tasks.Database.STORE, newSession(), new DataPoint(now, value)));
			
			value += Math.random();
			now += 1 * 60 * 60 * 1000;
		}
	}
	
	private void runRemote(String ip, int port)
	{
		try
		{
			Connection c = new TCPConnection(new Socket(InetAddress.getByName(ip), port));
			Message<Task> req = new Message<>(LocalAddress.BROADCAST, Units.SYSTEM, new Task(Tasks.System.Report.REQUEST, 99));
			
			c.send(req.save());
			
			JsonValue rep = c.receive();
			
			System.out.println("Received: ");
			System.out.println(rep.toString(new PrettyPrinter()));
			
			c.close();
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
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
		getNode().send(Units.SYSTEM, new Task(Tasks.System.Report.REQUEST, newSession()));
	}
	
	private void runHelp( )
	{
		mCommands.forEach(cmd -> {
			mCommands.printf("%10s | %s\n", cmd.getID(), cmd.help());
		});
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
