package spr.net;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.DelayQueue;
import java.util.concurrent.Delayed;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import dave.net.server.PacketedServer;
import dave.net.server.Server;
import dave.net.server.Server.Datagram;
import dave.json.SevereIOException;
import dave.util.log.Severity;
import spr.net.common.Address;
import spr.net.common.Message;

public class UDPBroker<T> extends BaseBroker<T>
{
	private final Consumer<Message<T>> mCallback;
	private final PacketedServer mServer;
	private final ExecutorService mAsync;
	private final BlockingQueue<Entry<T>> mBacklog;
	private boolean mRunning;
	
	public UDPBroker(Consumer<Message<T>> cb, int port)
	{
		super(ID);
		
		mCallback = cb;
		mAsync = Executors.newSingleThreadExecutor();
		mBacklog = new DelayQueue<>();
		mRunning = false;
		
		try
		{
			mServer = Server.createUDPServer(port, this::receive);
		}
		catch(IOException e)
		{
			LOG.log(Severity.FATAL, "Can't establish UDP server on port %d!", port);
			
			throw new SevereIOException(e);
		}
	}
	
	@Override
	public void start( )
	{
		mRunning = true;
		mServer.start();
		mAsync.submit(this::run);
	}
	
	@Override
	public void stop( )
	{
		mRunning = false;
		mAsync.shutdown();
		mServer.stop();
	}
	
	private int run( ) throws InterruptedException
	{
		while(mRunning)
		{
			Entry<T> e = mBacklog.poll(100, TimeUnit.MILLISECONDS);
			
			if(e != null) process(e);
		}
		
		return 0;
	}
	
	private void receive(Datagram p)
	{
		Message<T> msg = Message.load(p.payload);
		UniqueAddress from = new UniqueAddress(msg.getSender().getID(), p.source);
		
		msg = new Message<>(from, msg.getRecipient(), msg.getContent());
		
		mCallback.accept(msg);
	}

	@Override
	public void accept(Message<T> p)
	{
		if(p.getRecipient() instanceof UniqueAddress)
		{
			mBacklog.add(new Entry<>(p));
		}
		else
		{
			LOG.log(Severity.ERROR, "UDP broker received a packet to invalid remote! (%s)", p.getRecipient());
		}
	}
	
	private void process(Entry<T> e)
	{
		Message<T> msg = new Message<>(e.from, new LocalAddress(e.to.getID()), e.content);
		
		try
		{
			mServer.send(e.to.getRemote(), msg.save());
		}
		catch(IOException ex)
		{
			InetSocketAddress r = e.to.getRemote();
			Entry<T> next = new Entry<>(e);
			
			mBacklog.add(next);
			
			LOG.log(Severity.ERROR, "Couldn't send packet to %s:%d! Trying again in %ds!", r.getHostString(), r.getPort(), next.delay / 1000);
		}
	}
	
	private static class Entry<T> implements Delayed
	{
		public final Address from;
		public final UniqueAddress to;
		public final T content;
		private final int tries, delay;
		private final long now;
		
		public Entry(Message<T> p)
		{
			from = p.getSender();
			to = (UniqueAddress) p.getRecipient();
			content = p.getContent();
			tries = 0;
			delay = 0;
			now = System.currentTimeMillis();
		}
		
		public Entry(Entry<T> e)
		{
			from = e.from;
			to = e.to;
			content = e.content;
			tries = 1 + e.tries;
			delay = 1000 * ((tries > 6) ? 60 : (1 << (tries - 1)));
			now = System.currentTimeMillis();
		}

		@SuppressWarnings("unchecked")
		@Override
		public int compareTo(Delayed o)
		{
			return Integer.compare(delay, ((Entry<T>) o).delay);
		}

		@Override
		public long getDelay(TimeUnit time)
		{
			return time.convert(delay - (System.currentTimeMillis() - now), TimeUnit.MILLISECONDS);
		}
	}
	
	private static final String ID = "udp";
}
