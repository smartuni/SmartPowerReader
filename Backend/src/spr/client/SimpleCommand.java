package spr.client;

import dave.util.command.Command;
import dave.util.command.ParseException;

public class SimpleCommand implements Command
{
	private final String mID, mHelp;
	private final Runnable mCallback;
	
	public SimpleCommand(String name, String help, Runnable f)
	{
		mID = name;
		mHelp = help;
		mCallback = f;
	}
	
	@Override
	public String getID()
	{
		return mID;
	}

	@Override
	public String help()
	{
		return mHelp;
	}

	@Override
	public void execute(String[] args) throws ParseException
	{
		mCallback.run();
	}
}
