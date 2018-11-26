package spr.resource;

import org.eclipse.californium.core.CoapResource;

import spr.net.common.Gateway;
import spr.task.Task;

public abstract class Resource extends CoapResource
{
	private final Gateway<Task> mGateway;
	private long mSession;
	
	protected Resource(String name, Gateway<Task> g)
	{
		super(name);
		
		mGateway = g;
		mSession = 0;
	}

	public static final String MEASUREMENT = "measure";
	public static final String HELLO = "new-device";
	
	public static final class Format
	{
		public static final int PLAINTEXT = 0;
		public static final int BYTESTREAM = 42;
		public static final int JSON = 50;
		public static final int CBOR = 60;
		
		private Format( ) { }
	}
	
	protected Gateway<Task> getNode( ) { return mGateway; }
	protected long newSession( ) { return mSession++; }
}
