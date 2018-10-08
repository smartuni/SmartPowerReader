package spr.net.common;

import java.util.Objects;

import dave.json.Container;
import dave.json.JSON;
import dave.json.JsonObject;
import dave.json.JsonValue;
import dave.json.Loader;
import dave.json.Saveable;
import dave.json.Saver;

@Container
public class Message<T> implements Saveable
{
	private final Address mSender, mRecipient;
	private final T mPayload;
	
	public Message(Address from, Address to, T p)
	{
		mSender = from;
		mRecipient = to;
		mPayload = p;
	}
	
	public Address getSender( ) { return mSender; }
	public Address getRecipient( ) { return mRecipient; }
	public T getContent( ) { return mPayload; }
	
	@Override
	@Saver
	public JsonValue save( )
	{
		JsonObject json = new JsonObject();
		
		json.put("from", JSON.serialize(mSender));
		json.put("to", JSON.serialize(mRecipient));
		json.put("payload", JSON.serialize(mPayload));
		
		return json;
	}
	
	@SuppressWarnings("unchecked")
	@Loader
	public static <T> Message<T> load(JsonValue json)
	{
		JsonObject o = (JsonObject) json;
		
		Address from = (Address) JSON.deserialize(o.get("from"));
		Address to = (Address) JSON.deserialize(o.get("to"));
		T payload = (T) JSON.deserialize(o.get("payload"));
		
		return new Message<>(from, to, payload);
	}
	
	@Override
	public int hashCode( )
	{
		return (mSender.hashCode() * 13) ^ (mRecipient.hashCode() * 23) ^ Objects.hashCode(mPayload) ^ 0x23746298;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public boolean equals(Object o)
	{
		if(o instanceof Message)
		{
			Message<T> msg = (Message<T>) o;
			
			return mSender.equals(msg.mSender) && mRecipient.equals(msg.mRecipient) && Objects.equals(mPayload, msg.mPayload);
		}
		
		return false;
	}
	
	@Override
	public String toString( )
	{
		return String.format("{%s -> %s: %s}", mSender, mRecipient, mPayload);
	}
}
