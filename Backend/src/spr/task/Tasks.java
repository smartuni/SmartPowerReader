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
		
		private System( ) { }
	}
	
	private Tasks( ) { }
}
