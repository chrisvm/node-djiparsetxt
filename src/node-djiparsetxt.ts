#!/usr/bin/env node
import path from "path";
import {
	IFile,
	OutputCommand,
	ParseRecordsCommand,
	PrintInfoCommand,
	ReadFileCommand,
	SerializeRecordsCommand,
	ShowTypeCommand,
	TransformRecordsCommand,
	UnscrambleCommand,
} from "./commands";
import { CliArguments } from "./common/CliArguments";
import { ServiceManager, ServiceTypes } from "./common/ServiceManager";
import { CacheTransformService } from "./services/CacheTransformService";
import { FileParsingService } from "./services/FileParsingService";
import { RecordTypes } from "./services/RecordTypes";

function execute_cli(args: string[]) {
	const argv = new CliArguments(args);

	// assert cli args
	if (argv.assert_args()) {
		return;
	}

	// create managers
	const serviceMan = new ServiceManager();
	let command;

	// read files from arguments
	const files: IFile[] = new ReadFileCommand(serviceMan).exec(argv.file_paths);

	for (const file of files) {
		if (argv.print_header || argv.print_records || argv.details || argv.distrib) {
			command = new PrintInfoCommand(serviceMan);
			const output = command.exec({
				file,
				printHeader: argv.print_header,
				printRecords: argv.print_records,
				printDetails: argv.details,
				printDistribution: argv.distrib,
			});

			command = new OutputCommand(serviceMan);
			command.exec({ file: file.path, buffer: output, output: argv.output });
			return;
		}

		command = new ParseRecordsCommand(serviceMan);
		const records = command.exec({ file });

		if (records.isEmpty) {
			continue;
		}

		if (argv.unscramble) {
			command = new UnscrambleCommand(serviceMan);
			command.exec({ records });

			command = new SerializeRecordsCommand(serviceMan);
			const buffer = command.exec({ file, records });

			command = new OutputCommand(serviceMan);
			const output = argv.output === undefined ? path.dirname(file.path) : argv.output;
			command.exec({ file: file.path + ".unscrambled", buffer, output});
			return;
		}

		if (argv.show_record != null) {
			const type = argv.show_record as RecordTypes;
			command = new ShowTypeCommand(serviceMan);
			command.exec({ type, records, file, output: argv.output });
			return;
		}

		command = new TransformRecordsCommand(serviceMan);
		command.exec({ records, output: argv.output, prettyPrint: argv.pretty_print });
	}
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
	const serviceMan = new ServiceManager();

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
