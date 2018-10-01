package spr.net;

import spr.net.common.Broker;

public abstract class BaseBroker<T> implements Broker<T>
{
	private final String mID;
	
	public BaseBroker(String id)
	{
		mID = id;
	}
	
	@Override
	public String getID( )
	{
		return mID;
	}
}
