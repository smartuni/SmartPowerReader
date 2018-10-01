package spr.unit;

import spr.net.common.Gateway;
import spr.task.Task;

public class BaseUnit implements Unit
{
	private final Gateway<Task> mGateway;
	
	public BaseUnit(Gateway<Task> g)
	{
		mGateway = g;
	}
	
	protected Gateway<Task> getNode( ) { return mGateway; }
}
