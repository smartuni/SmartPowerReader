package spr.net.common;

import java.util.function.Consumer;

import dave.util.Actor;
import dave.util.Identifiable;
import dave.util.log.Logger;

public interface Broker<T> extends Consumer<Message<T>>, Actor, Identifiable
{
	public default void start( ) { }
	public default void stop( ) { }
	
	public static final Logger LOG = Logger.get("bus");
}
