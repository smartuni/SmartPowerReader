package spr.unit;

import java.util.function.Consumer;

import spr.net.common.Message;
import spr.net.common.Node;
import spr.task.Task;

public interface Unit extends Consumer<Message<Task>>
{
	public Node<Task> getNode( );
}
