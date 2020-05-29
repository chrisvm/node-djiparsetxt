#!/usr/bin/env node
import ejs from "ejs";
import fs from "fs";
import _ from "lodash";
import path from "path";
const DEFAULT_IMAGE: string = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

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
import { CacheTransformService } from "./services/CacheTransformService";
import { FileInfoService } from "./services/FileInfoService";
import { FileParsingService } from "./services/FileParsingService";
import { RecordTypes } from "./services/RecordTypes";
import { IRowObject, IHeaderInfo, IRecord } from "./shared/interfaces";

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

//#region Public API

/**
 * Parse the record from the given file.
 * @param buf File buffer of a log.
 * @param filter Function to use as a filter for the rows, only IRecord's that return true are returned.
 * @returns Array of rows with each row being
 * an object where the keys are the record type.
 */
export function parse_file(buf: Buffer, filter?: (row: IRowObject) => boolean): IRowObject[] {
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
	let parsedRows = cacheTransService.rows_to_json(unscrambledRows);

	// if a filter is given, apply it to the rows
	if (filter !== undefined && filter !== null) {
		parsedRows = parsedRows.filter((val) => filter(val));
	}

	return parsedRows;
}

/**
 * Get details section of the given file.
 * @param buf File buffer of a log.
 * @returns Object with the parsed details section.
 */
export function get_details(buf: Buffer): any {
	const serviceMan = new ServiceManager();
	const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
	return fileInfoService.get_details(buf);
}

/**
 * Get header section of the given file.
 * @param buf File buffer of a log.
 * @returns Object with the parsed header section.
 */
export function get_header(buf: Buffer): IHeaderInfo {
	const serviceMan = new ServiceManager();
	const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
	return fileInfoService.get_header_info(buf);
}

/**
 * Returns a KML string.
 * @param buf File buffer of a log
 * @param image Optional image param for the kml
 * @returns Array of jpeg buffers.
 */
export async function get_kml(buf: Buffer, image?: string, removeNoSignalRecords: boolean = false): Promise<string> {
	let filter = (row: IRowObject) => true;
	
	// if removeNoSignalRecords is set, we remove the frames with OSD.gps_level on zero.
	if (removeNoSignalRecords) {
		filter = (row: IRowObject) => row.OSD.gps_level !== 0;
	}

	const parsedRows = parse_file(buf, filter);

	let results: string = "";
	let homeCoordinates: string = "";
	let imageURL: string = "";
	if (!image) {
		imageURL = DEFAULT_IMAGE;
	} else {
		imageURL = image;
	}

	for (let index = 0; index < parsedRows.length; index += 1) {
		const rec = parsedRows[index];
		const long: number = rec.OSD.longitude;
		const lat: number = rec.OSD.latitude;
		const location: string = long + "," + lat + " ";
		results += location;

		// if first coord, set home to it
		if (index === 0) {
			homeCoordinates = location;
		}
	}
 
	const templateFilePath = path.join(__dirname, "/template/kml-template.ejs");
	const kmlTemplate = fs.readFileSync(templateFilePath, "utf8");
	const kml: string = await ejs.render(kmlTemplate, {
		imageurl: imageURL,
		homeCoordinates,
		coordinates: results,
	});

	return kml;
}

/**
 * Get the jpegs in file.
 * @param buf File buffer of a log
 * @returns Array of jpeg buffers.
 */
export function get_jpegs(buf: Buffer): Buffer[] {
	let jpegs: Buffer[] = [];
	const serviceMan = new ServiceManager();

	const fileParsingService = serviceMan.get_service<FileParsingService>(
		ServiceTypes.FileParsing,
	);

	const cacheTransService = serviceMan.get_service<CacheTransformService>(
		ServiceTypes.CacheTransform,
	);

	const cache = fileParsingService.parse_records(buf);
	cacheTransService.unscramble(cache);
	const jpegRecords = cache.records.filter((rec) => rec.type === RecordTypes.JPEG);
	for (const record of jpegRecords) {
		// ignore zero bytes images
		if (record.data[0].length === 0) continue;
		jpegs = jpegs.concat(record.data);
	}
	return jpegs;
}

export * from "./shared/interfaces";
//#endregion
