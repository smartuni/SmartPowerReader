package spr.client;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.LinkedList;
import java.util.List;
import java.util.function.DoubleFunction;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import dave.util.io.SevereIOException;
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
		}
		catch (IOException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Couldn't read file: %s", e.getMessage());
			
			throw new SevereIOException(e);
		}
	}

	@Override
	public void store(DataPoint p)
	{
		mContent.add(p);
		
		try(RandomAccessFile f = new RandomAccessFile(mFile, "a"))
		{
			byte[] data = new byte[Long.BYTES + Double.BYTES];
			ByteBuffer buf = ByteBuffer.wrap(data);
			
			buf.putLong(p.timestamp);
			buf.putDouble(p.value);
			
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

	@Override
	public Stream<DataPoint> interval(long lower, long upper, int count)
	{
		List<DataPoint> l = mContent.stream().filter(p -> p.timestamp >= lower && p.timestamp <= upper).collect(Collectors.toList());
		double d = (upper - lower) / (double) count;
		DoubleFunction<DataPoint> f = p -> {
			int i1 = (int) Math.floor(p);
			int i2 = (int) Math.ceil(p);
			
			DataPoint p1 = l.get(i1);
			
			if(i1 == i2)
				return p1;
			
			DataPoint p2 = l.get(i2);
			
			p -= i1;
			
			return new DataPoint(
				(long) (p1.timestamp + p * (p2.timestamp - p1.timestamp)),
				p1.value + p * (p2.value - p1.value));
		};
		
		return IntStream.range(0, (int) (upper - lower)).mapToDouble(i -> lower + i * d).mapToObj(f);
	}
}
