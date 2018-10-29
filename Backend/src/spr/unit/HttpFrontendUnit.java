package spr.unit;

import java.io.IOException;

import org.eclipse.californium.core.CoapResource;
import org.eclipse.californium.core.CoapServer;
import org.eclipse.californium.core.network.config.NetworkConfig;
import org.eclipse.californium.core.server.resources.CoapExchange;
import org.eclipse.californium.proxy.ProxyHttpServer;
import org.eclipse.californium.proxy.resources.ForwardingResource;
import org.eclipse.californium.proxy.resources.ProxyCoapClientResource;
import org.eclipse.californium.proxy.resources.ProxyHttpClientResource;

import dave.json.SevereIOException;
import spr.net.common.Node;
import spr.task.Task;
import spr.util.ProxyMessageDeliverer;

public class HttpFrontendUnit extends BaseUnit
{
	private final CoapServer mCoapProxy;
	private final ProxyHttpServer mHttpServer;
	
	public HttpFrontendUnit(int port, Node<Task> g)
	{
		super(g);
		
		long timeout = NetworkConfig.getStandard().getLong(NetworkConfig.Keys.HTTP_SERVER_SOCKET_TIMEOUT);
		ForwardingResource coap2coap = new ProxyCoapClientResource(timeout);
		ForwardingResource coap2http = new ProxyHttpClientResource(timeout);
		
		int coap_port = NetworkConfig.getStandard().getInt(NetworkConfig.Keys.COAP_PORT);
		
		mCoapProxy = new CoapServer(coap_port);
		
		mCoapProxy.setMessageDeliverer(new ProxyMessageDeliverer(mCoapProxy.getRoot(), coap2coap, coap2http));
		
		mCoapProxy.add(new TargetResource("measurements"));
		
		mCoapProxy.start();
		
		try
		{
			mHttpServer = new ProxyHttpServer(coap2coap, port);
		}
		catch(IOException e)
		{
			throw new SevereIOException(e);
		}
	}
	
	private static class TargetResource extends CoapResource
	{
		public TargetResource(String name)
		{
			super(name);
		}
		
		@Override
		public void handleGET(CoapExchange e)
		{
			System.out.println("from " + e.getSourceAddress().getHostAddress() + " got " + e.getRequestText());
		}
	}
}
