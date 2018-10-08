package spr;

import dave.util.ShutdownService;
import dave.util.TransformingConsumer;
import dave.util.Utils;
import dave.util.log.LogBase;
import dave.util.log.SimpleFormatter;
import dave.util.log.Spacer;
import spr.unit.SystemBuilder;
import spr.unit.SystemBuilder.DistributedNetwork;
import spr.unit.SystemBuilder.BaseModule;

public class Start
{
	public static void main(String[] args)
	{
		LogBase.INSTANCE.registerSink(e -> true, new TransformingConsumer<>(new Spacer(e -> System.out.println(e), 1500, Utils.repeat("=", 100)), new SimpleFormatter()));
		LogBase.INSTANCE.start();
		
		ShutdownService.INSTANCE.register(LogBase.INSTANCE::stop);
		
		(new SystemBuilder(new DistributedNetwork()))
			.install(new BaseModule())
			.run();
		
		ShutdownService.INSTANCE.shutdown();
		
		System.exit(0);
	}
}
