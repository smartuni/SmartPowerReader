package spr.net;

import java.util.function.Consumer;

import dave.util.log.Severity;
import spr.net.common.Broker;
import spr.net.common.Message;

public class LoggingConsumer<T> implements Consumer<Message<T>>
{
	@Override
	public void accept(Message<T> msg)
	{
		Broker.LOG.log(Severity.WARNING, "This packet belongs to no-one: %s", msg.toString());
	}
}
