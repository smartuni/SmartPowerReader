package spr.net;

import java.util.LinkedList;
import java.util.List;
import java.util.function.Predicate;

import dave.util.log.Severity;
import spr.net.common.Broker;
import spr.net.common.Message;

public class Backbone<T> extends BaseBroker<T>
{
	private final List<Handler<T>> mHandlers;
	
	public Backbone(Broker<T> def)
	{
		super(ID);
		
		if(def == null)
			throw new NullPointerException();
		
		mHandlers = new LinkedList<>();
		
		mHandlers.add(new Handler<>(msg -> true, def));
		
		LOG.log(Severity.INFO, "Started new backbone with broker %s as default", def.getID());
	}
	
	public Backbone<T> register(Predicate<Message<T>> f, Broker<T> cb)
	{
		mHandlers.add(0, new Handler<>(f, cb));
		
		LOG.log(Severity.INFO, "Registering new broker %s", cb.getID());
		
		return this;
	}
	
	@Override
	public void accept(Message<T> msg)
	{
		for(Handler<T> h : mHandlers)
		{
			if(h.filter.test(msg))
			{
				h.callback.accept(msg);
				
				break;
			}
		}
	}
	
	private static class Handler<T>
	{
		public final Broker<T> callback;
		public final Predicate<Message<T>> filter;
		
		public Handler(Predicate<Message<T>> f, Broker<T> cb)
		{
			callback = cb;
			filter = f;
		}
	}
	
	private static final String ID = "backbone";
}
