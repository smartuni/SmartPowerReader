package spr.util.persistance;

import java.util.stream.Stream;

public interface Storage
{
	public abstract void store(DataPoint p);
	public abstract DataPoint retrieve(long t);
	public abstract Stream<DataPoint> interval(long lower, long upper, int count);
}
