package spr.net.common;

import dave.util.Identifiable;

public interface Gateway<T> extends Identifiable
{
	public abstract void send(Address to, T message);
}
