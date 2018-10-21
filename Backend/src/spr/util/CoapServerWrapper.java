package spr.util;

import org.eclipse.californium.core.CoapServer;

import dave.util.Actor;

public class CoapServerWrapper implements Actor
{
	private final CoapServer mServer;
	
	public CoapServerWrapper(CoapServer s)
	{
		mServer = s;
	}

	@Override
	public void start()
	{
		mServer.start();
	}

	@Override
	public void stop()
	{
		mServer.stop();
	}
}
