package spr;

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
import spr.unit.SystemBuilder.NetworkModule;

public class Start
{
	public static void main(String[] args)
	{
		LogBase.INSTANCE.registerSink(e -> true, new TransformingConsumer<>(new Spacer(e -> System.out.println(e), 1500, Utils.repeat("=", 100)), new SimpleFormatter()));
		LogBase.INSTANCE.start();
		
		ShutdownService.INSTANCE.register(LogBase.INSTANCE::stop);
		
		Configuration<Params> options = parseArguments(args);
		
		(new SystemBuilder(new DistributedNetwork()))
			.install(new BaseModule())
			.install(new NetworkModule((int) options.get(Params.TCP_PORT)))
			.run();
		
		ShutdownService.INSTANCE.shutdown();
		
		System.exit(0);
	}
	
	private static Configuration<Params> parseArguments(String[] args)
	{
		Configuration<Params> opts = new OptionHash<>();
		
		Option o_port = (new OptionBuilder("port")).setShortcut("p").build();
		Parser parser = new Parser(o_port);
		
		try
		{
			Arguments a = parser.parse(args);
			
			if(a.hasArgument(o_port))
			{
				opts.set(Params.TCP_PORT, Integer.parseInt(a.getArgument(o_port)));
			}
		}
		catch(ParseException e)
		{
			Logger.DEFAULT.log(Severity.FATAL, "Invalid arguments: %s!", e.getMessage());
			
			System.err.println(e.getMessage());
		}
		
		return opts;
	}
	
	private static enum Params implements dave.util.config.Option
	{
		TCP_PORT(9900)
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
