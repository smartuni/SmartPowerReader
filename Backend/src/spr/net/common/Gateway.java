package spr.net.common;

import dave.util.Identifiable;
import spr.unit.Units;

public interface Gateway<T> extends Identifiable
{
	public abstract void send(Address to, T message);
	
	public default void send(String id, T message)
	{
		send(Units.get(id), message);
	}
}
