#!/usr/bin/env node
import { CliArguments } from "./common/CliArguments";
import { CommandManager, CommandTypes } from "./common/CommandManager";
import { ServiceManager, ServiceTypes } from "./common/ServiceManager";
import { CacheTransformService } from "./services/CacheTransformService";
import { FileParsingService } from "./services/FileParsingService";

function execute_cli(args: string[]) {
	const argv = new CliArguments(args);

	// assert cli args
	if (argv.assert_args()) {
		return;
	}

	// create managers
	const serviceMan = new ServiceManager(argv);
	const commandMan = new CommandManager(serviceMan);

	if (argv.print_header || argv.print_records || argv.details || argv.distrib) {
		commandMan.run(CommandTypes.PrintInfo);
		return;
	}

	if (argv.unscramble) {
		commandMan.run(CommandTypes.Unscramble);
		return;
	}

	if (argv.show_record != null) {
		commandMan.run(CommandTypes.ShowType);
		return;
	}

	commandMan.run(CommandTypes.TransformRecords);
}

// this is what runs when called as a tool
if (require.main === module) {
	try {
		const args = process.argv.slice(2);
		execute_cli(args);
	} catch (e) {
		const processName = "node-djiparsetxt";
		console.log(`${processName}: ${e}`);
	}
}

// public api when used as a module
export function parse_file(buf: Buffer): any[][] {
	const serviceMan = new ServiceManager(CliArguments.CreateEmpty());

	const fileParsingService = serviceMan.get_service<FileParsingService>(
		ServiceTypes.FileParsing,
	);

	const cacheTransService = serviceMan.get_service<CacheTransformService>(
		ServiceTypes.CacheTransform,
	);

	const recordsCache = fileParsingService.parse_records(buf);
	const outputBuf = cacheTransService.transform(recordsCache);
	return outputBuf;
}
