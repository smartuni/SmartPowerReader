package spr;

import java.net.InetAddress;
import java.net.InetSocketAddress;

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
import spr.unit.SystemBuilder;
import spr.unit.SystemBuilder.DistributedNetwork;
import spr.unit.SystemBuilder.BaseModule;
import spr.unit.SystemBuilder.FrontendModule;
import spr.unit.SystemBuilder.NodeLogicModule;

public class Start
{
	public static void main(String[] args)
	{
		LogBase.INSTANCE.registerSink(e -> true, new TransformingConsumer<>(new Spacer(e -> System.out.println(e), 1500, Utils.repeat("=", 100)), new SimpleFormatter()));
		LogBase.INSTANCE.start();
		
		ShutdownService.INSTANCE.register(LogBase.INSTANCE::stop);
		
		if(args.length == 1 && args[0].equals("list"))
		{
			Logger.DEFAULT.log(Severity.INFO, "Listing all available interfaces:");
			for(InetAddress a : EndpointManager.getEndpointManager().getNetworkInterfaces())
			{
				if(a.isLoopbackAddress()) continue;
				if(a.isLinkLocalAddress()) continue;
				
				String ip = a.getHostAddress();
				
				if(ip.contains("%lowpan"))
					Logger.DEFAULT.log(Severity.INFO, "%s", a.getHostAddress());
			}
		}
		else try
		{
			Configuration<Params> options = parseArguments(args);
			
			(new SystemBuilder(new DistributedNetwork()))
				.install(new BaseModule())
				.install(new FrontendModule((int) options.get(Params.TCP_PORT)))
				.install(new NodeLogicModule(new InetSocketAddress(InetAddress.getLocalHost(), (int) options.get(Params.COAP_PORT))))
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
