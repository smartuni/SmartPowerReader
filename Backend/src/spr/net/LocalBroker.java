package spr.net;

import java.util.HashMap;
import java.util.Map;

import dave.util.log.Severity;
import spr.net.common.Message;
import spr.net.common.Node;

public class LocalBroker<T> extends BaseBroker<T>
{
	private final Map<String, Node<T>> mNodes;
	
	public LocalBroker( )
	{
		super(ID);
		
		mNodes = new HashMap<>();
	}
	
	public LocalBroker<T> register(Node<T> node)
	{
		String id = node.getID();
		
		if(mNodes.put(id, node) != null)
			throw new IllegalArgumentException("Duplicate node " + id);
		
		LOG.log(Severity.INFO, "Registering node %s", id);
		
		return this;
	}
	
	public LocalBroker<T> deregister(String id)
	{
		if(mNodes.remove(id) == null)
			throw new IllegalArgumentException("Unknown node " + id);
		
		LOG.log(Severity.INFO, "Deregistered node %s", id);
		
		return this;
	}

	@Override
	public void accept(Message<T> msg)
	{
		if(!(msg.getRecipient() instanceof LocalAddress))
			throw new IllegalArgumentException(msg.toString());
		
		if(msg.getRecipient().equals(LocalAddress.BROADCAST))
		{
			mNodes.values().stream().forEach(n -> n.accept(msg));
		}
		else
		{
			String id = ((LocalAddress) msg.getRecipient()).getID();
			Node<T> r = mNodes.get(id);
			
			if(r != null)
			{
				LOG.log("%s", msg.toString());
				
				r.accept(msg);
			}
			else
			{
				LOG.log(Severity.ERROR, "Attempted to send message to unknown node %s! [%s]", id, msg.toString());
			}
		}
	}

	private static final String ID = "local";
}
