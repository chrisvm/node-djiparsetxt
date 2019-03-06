#!/usr/bin/env node
import {CliArguments} from './common/CliArguments';
import { FileParsingService } from "./services/FileParsingService";
import { CacheTransformService } from "./services/CacheTransformService";
import {ServiceManager, ServiceTypes} from './common/ServiceManager';
import {CommandManager, CommandTypes} from './common/CommandManager';

function process_args(args: string[])
{
  const argv = new CliArguments(args);

	// assert cli args
	if (argv.assert_args()) {
		return;
	}

	// create managers
	const service_man = new ServiceManager(argv);
	const command_man = new CommandManager(service_man);

	if (argv.print_header || argv.print_records || argv.details || argv.distrib) {
		command_man.run(CommandTypes.PrintInfo);
		return;
	}

	if (argv.unscramble) {
		command_man.run(CommandTypes.Unscramble);
		return;
	}
	
	if (argv.show_record != null) {
		command_man.run(CommandTypes.ShowType);
		return;
	}

	command_man.run(CommandTypes.TransformRecords);
}

// main function
function main () 
{
	const process_name = 'node-djiparsetxt';
	const args = process.argv.slice(2);
	try {
		process_args(args);
	}
	catch (e) {
		console.log(`${process_name}: ${e}`);
	}
}

if (require.main == module) {
	main();
}

type ParsedOutput = {files: {[name: string]: any[][]}};

export function parse_file(name: string, buf: Buffer): ParsedOutput
{
	const service_man = new ServiceManager(CliArguments.CreateEmpty());
	const file_parsing_service = service_man.get_service(
		ServiceTypes.FileParsing
	) as FileParsingService;
	
	const cache_trans_service = service_man.get_service(
		ServiceTypes.CacheTransform
	) as CacheTransformService;

	const output: ParsedOutput = {
		files: {}
	};

	const records_cache = file_parsing_service.parse_records(buf);
	const output_buf = cache_trans_service.transform(records_cache);
	output.files[name] = output_buf;
	return output;
}
