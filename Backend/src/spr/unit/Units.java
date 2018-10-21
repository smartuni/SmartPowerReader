package spr.unit;

import spr.net.LocalAddress;

public final class Units
{
	public static final class IDs
	{
		public static final String SYSTEM = "system";
		public static final String TIMER = "timer";
		public static final String DATABASE = "database";
		public static final String USER = "user";
		public static final String CONNECTION = "connection";
		public static final String FRONTEND = "front-end";
		public static final String COAP = "coap";
		
		private IDs( ) { }
	}
	
	public static final LocalAddress SYSTEM = new LocalAddress(IDs.SYSTEM);
	public static final LocalAddress TIMER = new LocalAddress(IDs.TIMER);
	public static final LocalAddress DATABASE = new LocalAddress(IDs.DATABASE);
	public static final LocalAddress FRONTEND = new LocalAddress(IDs.FRONTEND);
	public static final LocalAddress COAP = new LocalAddress(IDs.COAP);
	
	private Units( ) { }
}
