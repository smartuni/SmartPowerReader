package spr.task;

public final class Tasks
{
	public static final class Timer
	{
		public static final class Schedule
		{
			public static final String ONE_SHOT = "timer.schedule.one-shot";
			public static final String PERIODIC = "timer.schedule.periodic";
			public static final String REMOVE = "timer.schedule.remove";
			
			private Schedule( ) { }
		}
		
		private Timer( ) { }
	}
	
	public static final class System
	{
		public static final class Status
		{
			public static final String QUERY = "system.status.query";
			public static final String INFO = "system.status.info";
			
			private Status( ) { }
		}
		
		public static final class Report
		{
			public static final String REQUEST = "system.report.request";
			public static final String STATUS = "system.report.status";
		}
		
		public static final String STARTUP = "system.start";
		public static final String SHUTDOWN = "system.shutdown";
		
		private System( ) { }
	}
	
	public static final class Database
	{
		public static final String STORE = "database.store";
		public static final String RETRIEVE = "database.retrieve";
		public static final String DELIVER = "database.deliver";
		public static final String UNKNOWN = "database.unknown";
		public static final String DELETE = "database.delete";
		
		private Database( ) { }
	}
	
	public static final class Frontend
	{
		public static final String ABORT = "frontend.abort";
		
		private Frontend( ) { }
	}
	
	public static final class Coap
	{
		public static final String SEND = "send";
		
		private Coap( ) { }
	}
	
	private Tasks( ) { }
}
