package spr.client;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.ArrayDeque;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.function.DoubleFunction;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import dave.json.SevereIOException;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.util.persistance.DataPoint;
import spr.util.persistance.Storage;

public class SimpleStorage implements Storage
{
	private final File mFile;
	private final List<DataPoint> mContent;
	
	public SimpleStorage(File p)
	{
		mFile = p;
		mContent = new LinkedList<>();
		
		if(mFile.exists()) try(RandomAccessFile f = new RandomAccessFile(mFile, "r"))
		{
			while(f.getFilePointer() < f.length())
			{
				byte[] data = new byte[Long.BYTES + Double.BYTES];
				ByteBuffer buf = ByteBuffer.wrap(data);
				
				f.read(data);
				
				long timestamp = buf.getLong();
				double value = buf.getDouble();
				
				mContent.add(new DataPoint(timestamp, value));
			}
			
			LOG.log("Loaded %d datapoints from %s in interval [%d, %d]", mContent.size(), p.getName(), mContent.get(0).timestamp, mContent.get(mContent.size() - 1).timestamp);
		}
		catch(IOException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Couldn't read file: %s", e.getMessage());
			
			throw new SevereIOException(e);
		}
	}

	@Override
	public void store(DataPoint p)
	{
		mContent.add(p);
		
		try(RandomAccessFile f = new RandomAccessFile(mFile, "rw"))
		{
			byte[] data = new byte[Long.BYTES + Double.BYTES];
			ByteBuffer buf = ByteBuffer.wrap(data);
			
			buf.putLong(p.timestamp);
			buf.putDouble(p.value);
			
			f.seek(f.length());
			f.write(data);
		}
		catch(IOException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Failed to write to file: %s", e.getMessage());
			
			throw new SevereIOException(e);
		}
	}

	@Override
	public DataPoint retrieve(long t)
	{
		return mContent.stream().filter(p -> p.timestamp == t).findFirst().orElse(null);
	}
	
	private static DataPoint lerp(DataPoint p0, DataPoint p1, double f)
	{
		return new DataPoint(
			(long) (p0.timestamp + f * (p1.timestamp - p0.timestamp)),
					p0.value     + f * (p1.value     - p0.value    ));
	}

	@Override
	public Stream<DataPoint> interval(long lower, long upper, int count)
	{
		LOG.log("Retrieving data form interval [%d, %d]", lower, upper);
		
		List<DataPoint> l = mContent.stream().filter(p -> p.timestamp >= lower && p.timestamp <= upper).collect(Collectors.toList());
		DataPoint[] o = new DataPoint[] { new DataPoint(0, 0) };
		double d = (upper - lower) / (double) (count - 1);
		
		LOG.log("%d datapoints found, scaling to %d in steps %f", l.size(), count, d);
		
		l.add(new DataPoint(Long.MAX_VALUE, 0));

		Queue<DataPoint> q = new ArrayDeque<>(l);

		DoubleFunction<DataPoint> f = p -> {
			long i = Math.round(p);
			
			while(q.peek().timestamp < i) o[0] = q.poll();
			
			DataPoint p0 = o[0], p1 = q.peek();
			
			if(i == p0.timestamp) return p0;
			else if(i == p1.timestamp) return p1;
			else return lerp(p0, p1, (i - p0.timestamp) / (double) (p1.timestamp - p0.timestamp));
		};
		
		return IntStream.range(0, count).mapToDouble(i -> lower + i * d).mapToObj(f);
	}
	
	private static final Logger LOG = Logger.get("db");
}
