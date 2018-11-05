package spr.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class FilenameGenerator implements ConsecutiveProducer<String>
{
	private int mIdx = 0;

	@Override
	public String produce()
	{
		return FORMAT.format(new Date()) + (mIdx++);
	}

	@Override
	public int compare(String a, String b)
	{
		return 0;
	}

    public static final SimpleDateFormat FORMAT = new SimpleDateFormat("yyyyMMdd_HHmmss_");
}
