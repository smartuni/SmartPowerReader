package spr.util;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractWatchdog implements Watchdog
{
	private final Map<String, Long> mCBs = new HashMap<>();
	
	@Override
	public void reset(String id, long ms)
	{
		if(ms > 0)
		{
			mCBs.put(id, ms);
		}
		else
		{
			mCBs.remove(id);
		}
		
		schedule(id, ms);
	}
	
	public void callback(String id)
	{
		long t1 = System.currentTimeMillis();
		Long t2 = mCBs.get(id);
		
		if(t2 != null && t1 > t2)
		{
			mCBs.remove(id);
			trigger(id);
		}
	}
	
	protected abstract void trigger(String id);
	protected abstract void schedule(String id, long ms);
}
