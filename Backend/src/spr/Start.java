package spr;

import java.net.Inet6Address;
import java.net.InetSocketAddress;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.californium.core.network.EndpointManager;

import dave.arguments.Arguments;
import dave.arguments.Option;
import dave.arguments.Option.OptionBuilder;
import dave.arguments.ParseException;
import dave.arguments.Parser;
import dave.util.ShutdownService;
import dave.util.TransformingConsumer;
import dave.util.Utils;
import dave.util.config.Configuration;
import dave.util.config.OptionHash;
import dave.util.log.LogBase;
import dave.util.log.Logger;
import dave.util.log.Severity;
import dave.util.log.SimpleFormatter;
import dave.util.log.Spacer;
import spr.common.SystemBuilder;
import spr.common.SystemBuilder.BaseModule;
import spr.common.SystemBuilder.DistributedNetwork;
import spr.common.SystemBuilder.FrontendModule;
import spr.common.SystemBuilder.NodeLogicModule;

public class Start
{
	public static void main(String[] args)
	{
		LogBase.INSTANCE.registerSink(e -> true, new TransformingConsumer<>(new Spacer(e -> System.out.println(e), 1500, Utils.repeat("=", 100)), new SimpleFormatter()));
		LogBase.INSTANCE.start();
		
		ShutdownService.INSTANCE.register(LogBase.INSTANCE::stop);
		
		try
		{
			Configuration<Params> options = parseArguments(args);

			int coap_port = (int) options.get(Params.COAP_PORT);
			List<InetSocketAddress> coap_endpoints = EndpointManager.getEndpointManager().getNetworkInterfaces().stream()
				.filter(a -> !a.isLoopbackAddress())
				.filter(a -> a instanceof Inet6Address)
				.filter(a -> a.getHostAddress().contains("%lowpan"))
				.map(a -> new InetSocketAddress(a, coap_port))
				.collect(Collectors.toList());

			(new SystemBuilder(new DistributedNetwork()))
				.install(new BaseModule())
				.install(new FrontendModule((int) options.get(Params.TCP_PORT)))
				.install(new NodeLogicModule(coap_endpoints))
				.run();
		}
		catch(Throwable e)
		{
			e.printStackTrace();
		}
		
		ShutdownService.INSTANCE.shutdown();
		
		System.exit(0);
	}
	
	private static Configuration<Params> parseArguments(String[] args) throws ParseException
	{
		Configuration<Params> opts = new OptionHash<>();
		
		Option o_port = (new OptionBuilder("port")).setShortcut("p").hasValue(true).build();
		Parser parser = new Parser(o_port);
		
		try
		{
			Arguments a = parser.parse(args);

			if(a.hasMainArgument())
				throw new IllegalArgumentException("Unexpected main argument: " + a.getMainArgument());
			
			if(a.hasArgument(o_port))
			{
				opts.set(Params.TCP_PORT, Integer.parseInt(a.getArgument(o_port)));
			}
		}
		catch(ParseException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Invalid arguments: %s!", e.getMessage());
			
			System.err.println(e.getMessage());

			throw e;
		}
		
		return opts;
	}
	
	private static enum Params implements dave.util.config.Option
	{
		COAP_PORT(9900),
		TCP_PORT(9901),
		UDP_PORT(9902)
		;

		@Override
		public Object getDefault()
		{
			return mDefault;
		}
		
		private final Object mDefault;
		
		private Params(Object o)
		{
			mDefault = o;
		}
	}
}
