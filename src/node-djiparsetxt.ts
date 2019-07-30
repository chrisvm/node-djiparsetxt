#!/usr/bin/env node
import { CliArguments } from "./common/CliArguments";
import { ServiceManager, ServiceTypes } from "./common/ServiceManager";
import { CacheTransformService } from "./services/CacheTransformService";
import { FileParsingService } from "./services/FileParsingService";
import {
	PrintInfoCommand,
	UnscrambleCommand,
	ShowTypeCommand,
	TransformRecordsCommand
} from "./commands";

function execute_cli(args: string[]) {
	const argv = new CliArguments(args);

	// assert cli args
	if (argv.assert_args()) {
		return;
	}

	// create managers
	const serviceMan = new ServiceManager(argv);

	if (argv.print_header || argv.print_records || argv.details || argv.distrib) {
		let cmd = new PrintInfoCommand(serviceMan);
		cmd.exec();
		return;
	}

	if (argv.unscramble) {
		let cmd = new UnscrambleCommand(serviceMan);
		cmd.exec();
		return;
	}

	if (argv.show_record != null) {
		let cmd = new ShowTypeCommand(serviceMan);
		cmd.exec();
		return;
	}

	let cmd = new TransformRecordsCommand(serviceMan);
	cmd.exec();
}

// this is what runs when called as a tool
if (require.main === module) {
	try {
		const args = process.argv.slice(2);
		execute_cli(args);
	} catch (e) {
		const processName = "node-djiparsetxt";
		console.log(`${processName}: ${e}`);
		console.log(e.stack);
	}
}

// public api when used as a module
export function parse_file(buf: Buffer): any[][] {
	const serviceMan = new ServiceManager(CliArguments.CreateEmpty());

	const fileParsingService = serviceMan.get_service<FileParsingService>(
		ServiceTypes.FileParsing
	);

	const cacheTransService = serviceMan.get_service<CacheTransformService>(
		ServiceTypes.CacheTransform
	);

	const recordsCache = fileParsingService.parse_records(buf);
	const outputBuf = cacheTransService.transform(recordsCache);
	return outputBuf;
}
