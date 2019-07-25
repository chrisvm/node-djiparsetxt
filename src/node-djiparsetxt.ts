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

// main function
function main() {
	const processName = "node-djiparsetxt";
	const args = process.argv.slice(2);
	try {
		execute_cli(args);
	} catch (e) {
		console.log(`${processName}: ${e}`);
	}
}

if (require.main === module) {
	main();
}

export interface IParsedOutput { files: { [name: string]: any[][] }; }

export function parse_file(name: string, buf: Buffer): IParsedOutput {
	const serviceMan = new ServiceManager(CliArguments.CreateEmpty());
	const fileParsingService = serviceMan.get_service<FileParsingService>(
		ServiceTypes.FileParsing,
	);

	const cacheTransService = serviceMan.get_service<CacheTransformService>(
		ServiceTypes.CacheTransform,
	);

	const output: IParsedOutput = {
		files: {},
	};

	const recordsCache = fileParsingService.parse_records(buf);
	const outputBuf = cacheTransService.transform(recordsCache);
	output.files[name] = outputBuf;

	return output;
}
