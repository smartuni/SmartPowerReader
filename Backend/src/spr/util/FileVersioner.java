package spr.util;

import java.io.File;
import java.nio.file.Path;

import dave.util.Producer;

public class FileVersioner implements Producer<File>
{
	private final Path mPath;
	private final ConsecutiveProducer<String> mGen;
	private File mLast;
	
	public FileVersioner(Path path, ConsecutiveProducer<String> gen)
	{
		mPath = path;
		mGen = gen;
		
		File f = mPath.toFile();
		
		if(f.exists() && f.isDirectory())
		{
			String[] files = f.list();
			String newest = null;
			
			if(files != null)
			{
				for(int i = 0 ; i < files.length ; ++i)
				{
					if(newest == null || mGen.compare(files[i], newest) > 0)
					{
						newest = files[i];
					}
				}
			}
			
			if(newest != null)
			{
				mLast = get(newest);
			}
		}
	}
	
	private File get(String fn) { return mPath.resolve(fn).toFile(); }
	
	public File get( )
	{
		return mLast;
	}

	@Override
	public File produce()
	{
		return mLast = get(mGen.produce());
	}
}
