package spr.net;

import dave.util.Actor;
import spr.net.common.Message;

public class FakeBroker<T, A extends Actor> extends BaseBroker<T>
{
	private final A mHook;
	
	public FakeBroker(String id, A o)
	{
		super(id);
		
		mHook = o;
	}
	
	@Override
	public void start( )
	{
		mHook.start();
	}
	
	@Override
	public void stop( )
	{
		mHook.stop();
	}

	@Override
	public void accept(Message<T> t)
	{
		throw new UnsupportedOperationException();
	}
}
