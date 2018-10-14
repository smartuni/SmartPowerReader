package spr.util.persistance;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Spliterator;
import java.util.function.Consumer;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class SimpleStorage implements Storage
{
	private final List<DataPoint> mData = new ArrayList<>();
	private long mEarliest = Long.MAX_VALUE, mLatest = 0;
	
	@Override
	public void store(DataPoint p)
	{
		long t = p.timestamp;
		double v = p.value;
		
		if(t < mEarliest)
		{
			mEarliest = t;
		}
		
		if(t > mLatest)
		{
			mData.add(new DataPoint(mLatest = t, v));
		}
		else
		{
			int i = 0;
			for(DataPoint pp : mData)
			{
				++i;
				
				if(pp.timestamp > t)
				{
					mData.add(i - 1, p);
					
					break;
				}
			}
		}
	}

	@Override
	public DataPoint retrieve(long t)
	{
		return new DataPoint(t, doRetrieve(t));
	}
	
	private double doRetrieve(long t)
	{
		if(t < mEarliest)
			return 0;
		
		if(t > mLatest)
			return mData.get(mData.size() - 1).value;

		int i = getLowerBound(t, -1);
		
		DataPoint lower = mData.get(i);
		
		if(lower.timestamp == t)
			return lower.value;
		
		DataPoint upper = mData.get(i + 1);
		
		return interpolate(lower.value, upper.value, (t - lower.timestamp) / (float) (upper.timestamp - lower.timestamp));
	}

	private double interpolate(double a, double b, float p) { return a + (b - a) * p; }
	private long interpolate(long a, long b, float p) { return (long) (a + (b - a) * p); }
	
	private int getLowerBound(long t, int guess)
	{
		int i1 = 0, i2 = mData.size();
		
		if(guess < 0) guess = (int) ((i2 - i1) * t / mLatest);
		
		while(i1 != i2)
		{
			DataPoint p = mData.get(guess);
			
			if(p.timestamp < t)
			{
				i2 = guess;
			}
			else if(p.timestamp > t)
			{
				i1 = guess;
			}
			else
			{
				break;
			}
			
			guess = (i1 + i2) / 2;
		}
		
		return guess;
	}

	@Override
	public Stream<DataPoint> interval(long lower, long upper, int count)
	{
		if(mData.isEmpty())
			return mData.stream();
		
		if(lower < mEarliest) lower = mEarliest;
		if(upper > mLatest) upper = mLatest;
		
		int lidx = getLowerBound(lower, -1);
		int uidx = getLowerBound(upper, -1) + 1;
		
		if(uidx - lidx <= count)
		{
			return StreamSupport.stream(new Spliterator<DataPoint>() {
				private final Iterator<DataPoint> i = mData.listIterator(lidx);
				private final int c = mData.spliterator().characteristics();
				private int l = uidx - lidx;
				
				@Override
				public int characteristics()
				{
					return c;
				}

				@Override
				public long estimateSize()
				{
					return l;
				}

				@Override
				public boolean tryAdvance(Consumer<? super DataPoint> action)
				{
					boolean f = l > 0;

					if(f)
					{
						--l;
						
						action.accept(i.next());
					}
					
					return f;
				}

				@Override
				public Spliterator<DataPoint> trySplit()
				{
					return null;
				}
				
			}, false);
		}
		else
		{
			float d = (uidx - lidx) / (float) count;
			Stream.Builder<DataPoint> s = Stream.builder();
			
			for(int i = 0 ; i < count ; ++i)
			{
				float t = lidx + i * d;
				DataPoint l = mData.get((int) t);
				
				if(t == (int) t)
				{
					s.accept(l);
				}
				else
				{
					DataPoint u = mData.get(1 + (int) t);
					
					t -= (int) t;
					
					long ts = interpolate(l.timestamp, u.timestamp, t);
					double v = interpolate(l.value, u.value, t);
					
					s.accept(new DataPoint(ts, v));
				}
			}
			
			return s.build();
		}
	}
}
