package spr.unit;

import java.util.HashMap;
import java.util.Map;

import spr.net.LocalAddress;
import spr.net.common.Address;

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
		public static final String CONFIG = "configuration";
		
		private IDs( ) { }
	}
	
	private static final Map<String, Address> sAddresses = new HashMap<>();
	
	public static Address get(String id)
	{
		Address a = sAddresses.get(id);
		
		if(a == null)
		{
			sAddresses.put(id, a = new LocalAddress(id));
		}
		
		return a;
	}
	
	public static void put(Address a)
	{
		sAddresses.put(a.getID(), a);
	}
	
	private Units( ) { }
}
