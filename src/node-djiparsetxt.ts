#!/usr/bin/env node
import _ from "lodash";
import path from "path";
import {
	IFile,
	JpegExtractCommand,
	OutputCommand,
	ParseRecordsCommand,
	PrintInfoCommand,
	ReadFileCommand,
	Records2CsvCommand,
	Records2JsonCommand,
	SerializeRecordsCommand,
	ShowTypeCommand,
	UnscrambleCommand,
} from "./commands";
import { CliArguments } from "./common/CliArguments";
import { ServiceManager, ServiceTypes } from "./common/ServiceManager";
import { CacheTransformService, IRowObject } from "./services/CacheTransformService";
import { FileInfoService, IHeaderInfo } from "./services/FileInfoService";
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
	let output;

	// read files from arguments
	const files: IFile[] = new ReadFileCommand(serviceMan).exec(argv.file_paths);

	for (const file of files) {
		if (argv.print_header || argv.print_records || argv.details || argv.distrib) {
			command = new PrintInfoCommand(serviceMan);
			output = command.exec({
				file,
				printHeader: argv.print_header,
				printRecords: argv.print_records,
				printDetails: argv.details,
				printDistribution: argv.distrib,
			});

			command = new OutputCommand(serviceMan);
			command.exec({ file: file.path, buffer: output, output: argv.output });
			continue;
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
			output = argv.output === undefined ? path.dirname(file.path) : argv.output;
			command.exec({ file: file.path + ".unscrambled", buffer, output});
			continue;
		}

		if (argv.show_record != null) {
			const type = argv.show_record as RecordTypes;
			command = new ShowTypeCommand(serviceMan);
			const buffer = command.exec({ type, records, file: file.path, output: argv.output });

			command = new OutputCommand(serviceMan);
			output = argv.output;
			command.exec({ file: file.path, buffer, output});
			continue;
		}

		if (argv.jpeg) {
			command = new JpegExtractCommand(serviceMan);
			command.exec({ records });
			continue;
		}

		let outputString: string;
		if (argv.csv) {
			command = new Records2CsvCommand(serviceMan);
			outputString = command.exec({ records, output: argv.output });
		} else {
			command = new Records2JsonCommand(serviceMan);
			outputString = command.exec({
				records,
				output: argv.output,
				prettyPrint: argv.pretty_print,
			});
		}

		command = new OutputCommand(serviceMan);
		output = argv.output ? argv.output : null;
		command.exec({ file: file.path, buffer: outputString, output});
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
export function parse_file(buf: Buffer): IRowObject[] {
	const serviceMan = new ServiceManager();

	const fileParsingService = serviceMan.get_service<FileParsingService>(
		ServiceTypes.FileParsing,
	);

	const cacheTransService = serviceMan.get_service<CacheTransformService>(
		ServiceTypes.CacheTransform,
	);

	const recordsCache = fileParsingService.parse_records(buf);
	cacheTransService.unscramble(recordsCache);
	const unscrambledRows = cacheTransService.cache_as_rows(recordsCache);
	const parsedRows = cacheTransService.rows_to_json(unscrambledRows);
	return parsedRows;
}

export function get_details(buf: Buffer): any {
	const serviceMan = new ServiceManager();
	const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
	return fileInfoService.get_details(buf);
}

export function get_header(buf: Buffer): IHeaderInfo {
	const serviceMan = new ServiceManager();
	const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
	return fileInfoService.get_header_info(buf);
}
