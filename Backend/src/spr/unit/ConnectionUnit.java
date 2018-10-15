package spr.unit;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

import dave.json.JsonBuilder;
import dave.json.JsonValue;
import dave.net.server.Connection;
import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;

public class ConnectionUnit extends BaseUnit
{
	private final Connection mConnection;
	private final Consumer<ConnectionUnit> mCallback;
	private final ExecutorService mAsync;
	private int mSent, mReceived;

	public ConnectionUnit(Connection c, Consumer<ConnectionUnit> f, Node<Task> g)
	{
		super(g);
		
		mConnection = c;
		mCallback = f;
		mAsync = Executors.newSingleThreadExecutor();
		mSent = mReceived = 0;
		
		mAsync.submit(this::run);
	}
	
	private void run( )
	{
		try
		{
			while(true)
			{
				Message<Task> p = Message.load(mConnection.receive());
				
				++mReceived;
				
				getNode().send(p.getRecipient(), p.getContent());
			}
		}
		catch(IOException e)
		{
			mCallback.accept(this);
		}
	}
	
	@Override
	public void accept(Message<Task> p)
	{
		++mSent;
		
		try
		{
			mConnection.send(p.save());
		}
		catch(IOException e)
		{
			e.printStackTrace();
		}
	}
	
	@Override
	protected JsonValue getStatus( )
	{
		return (new JsonBuilder()).putInt("sent", mSent).putInt("received", mReceived).toJSON();
	}
}
