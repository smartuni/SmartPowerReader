package spr.unit;

import java.io.IOException;
import java.net.Socket;

import org.eclipse.californium.core.CoapResource;
import org.eclipse.californium.core.CoapServer;
import org.eclipse.californium.core.coap.CoAP.ResponseCode;
import org.eclipse.californium.core.network.config.NetworkConfig;
import org.eclipse.californium.core.server.resources.CoapExchange;
import org.eclipse.californium.proxy.ProxyHttpServer;
import org.eclipse.californium.proxy.resources.ForwardingResource;
import org.eclipse.californium.proxy.resources.ProxyCoapClientResource;
import org.eclipse.californium.proxy.resources.ProxyHttpClientResource;

import dave.json.JsonObject;
import dave.json.SevereIOException;
import dave.net.server.Connection;
import dave.net.server.StreamingTransceiver;
import dave.net.server.TCPConnection;
import dave.util.Actor;
import dave.util.log.Logger;
import dave.util.log.Severity;
import spr.util.ProxyMessageDeliverer;

public class HttpFrontendProxy implements Actor
{
	private final CoapServer mCoapProxy;
	private final ForwardingResource mCoap2Coap, mCoap2Http;
	private final int mHttpPort;
	
	public HttpFrontendProxy(int http_port, int coap_port, int internal_port) throws IOException
	{
		long timeout = NetworkConfig.getStandard().getLong(NetworkConfig.Keys.HTTP_SERVER_SOCKET_TIMEOUT);
		mCoap2Coap = new ProxyCoapClientResource(timeout);
		mCoap2Http = new ProxyHttpClientResource(timeout);
		mHttpPort = http_port;
		
		mCoapProxy = new CoapServer(coap_port);
		
		mCoapProxy.setMessageDeliverer(new ProxyMessageDeliverer(mCoapProxy.getRoot(), mCoap2Coap, mCoap2Http));
		
		mCoapProxy.add(new TargetResource("measurements", internal_port));
	}
	
	@Override
	public void start( )
	{
		mCoapProxy.start();
		
		try
		{
			new ProxyHttpServer(mCoap2Coap, mHttpPort);
		}
		catch(IOException e)
		{
			throw new SevereIOException(e);
		}
	}
	
	@Override
	public void stop( )
	{
		mCoapProxy.stop();
	}
	
	private static class TargetResource extends CoapResource
	{
		private final int mInternalPort;
		
		public TargetResource(String name, int internal)
		{
			super(name);
			
			mInternalPort = internal;
		}
		
		@Override
		public void handleGET(CoapExchange ex)
		{
			try
			{
				JsonObject request = new JsonObject();
				
				request.putString("id", ex.getQueryParameter("id"));
				request.putLong("from", Long.parseLong(ex.getQueryParameter("from")));
				request.putLong("to", Long.parseLong(ex.getQueryParameter("to")));
				request.putInt("count", Integer.parseInt(ex.getQueryParameter("count")));
				
				Connection con = new TCPConnection(new Socket("localhost", mInternalPort), new StreamingTransceiver());
				
				con.send(request);
				
				ex.respond(con.receive().toString());
			}
			catch(NullPointerException | NumberFormatException e)
			{
				LOG.log(Severity.ERROR, "Invalid request: %s", e.getMessage());
				
				ex.respond(ResponseCode.BAD_REQUEST);
			}
			catch(IOException e)
			{
				LOG.log(Severity.ERROR, "Internal server error: %s", e.getMessage());
				
				ex.respond(ResponseCode.INTERNAL_SERVER_ERROR);
			}
		}
	}
	
	private static final Logger LOG = Logger.get("http-proxy");
}
