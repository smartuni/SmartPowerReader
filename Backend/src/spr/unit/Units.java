package spr.unit;

import spr.net.LocalAddress;

public final class Units
{
	public static final class IDs
	{
		public static final String SYSTEM = "system";
		public static final String TIMER = "timer";
		public static final String USER = "user";
		
		private IDs( ) { }
	}
	
	public static final LocalAddress SYSTEM = new LocalAddress(IDs.SYSTEM);
	public static final LocalAddress TIMER = new LocalAddress(IDs.TIMER);
	
	private Units( ) { }
}
