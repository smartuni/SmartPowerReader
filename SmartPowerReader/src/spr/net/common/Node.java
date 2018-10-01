package spr.net.common;

import java.util.function.Consumer;
import java.util.function.Function;

import dave.util.Identifiable;
import spr.net.LocalAddress;
import spr.net.LoggingConsumer;

public class Node<T> implements Identifiable, Gateway<T>, Consumer<Message<T>>
{
	private final String mID;
	private Consumer<Message<T>> mServer, mClient;
	
	public Node(String id) { this(id, new LoggingConsumer<>()); }
	public Node(String id, Consumer<Message<T>> def)
	{
		mID = id;
		mServer = mClient = def;
	}
	
	public Node<T> setClient(Function<Consumer<Message<T>>, Consumer<Message<T>>> f)
	{
		mClient = f.apply(mClient);
		
		return this;
	}
	
	public Node<T> setServer(Function<Consumer<Message<T>>, Consumer<Message<T>>> f)
	{
		mServer = f.apply(mServer);
		
		return this;
	}

	@Override
	public String getID()
	{
		return mID;
	}

	@Override
	public void send(Address to, T msg)
	{
		mServer.accept(new Message<>(new LocalAddress(mID), to, msg));
	}

	@Override
	public void accept(Message<T> msg)
	{
		mClient.accept(msg);
	}
}
