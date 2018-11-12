package spr.util;

import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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
			List<String> old = new ArrayList<>();
			
			if(files != null)
			{
				for(int i = 0 ; i < files.length ; ++i)
				{
					if(!files[i].endsWith(".conf")) continue;
					
					if(newest == null || mGen.compare(files[i], newest) < 0)
					{
						if(newest != null)
						{
							old.add(newest);
						}
						
						newest = files[i];
					}
				}
			}
			
			if(newest != null)
			{
				mLast = get(newest);
				
				old.forEach(fn -> get(fn).delete());
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
		return mLast = get(mGen.produce() + ".conf");
	}
}
