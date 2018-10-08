package spr.util.persistance;

public class DataPoint
{
	public final long timestamp;
	public final double value;
	
	public DataPoint(long t, double v)
	{
		timestamp = t;
		value = v;
	}
}
