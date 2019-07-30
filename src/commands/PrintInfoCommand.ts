import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { FileInfoService } from "../services/FileInfoService";
import { FileParsingService, IRecordCache } from "../services/FileParsingService";
import { RecordTypes } from "../services/RecordTypes";
import { Command } from "./Command";
import { IFile } from "./ReadFileCommand";

export interface IPrintInfoOptions {
	printHeader: boolean;
	printRecords: boolean;
	printDetails: boolean;
	printDistribution: boolean;
	file: IFile;
}

export class PrintInfoCommand extends Command<IPrintInfoOptions, string> {

	private _logs: string[] = [];

	public exec(options: IPrintInfoOptions): string {
		const serviceMan = this.serviceMan;
		const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
		const fileParsingService = serviceMan.get_service<FileParsingService>(ServiceTypes.FileParsing);

		const file = options.file;

		if (file.buffer === null) {
			return "";
		}

		// show header details
		this.log(`file "${file.path}"`);
		if (options.printHeader) {
			const headerInfo = fileInfoService.get_header_info(file.buffer);
			this.log("  Header Info:");
			this.log(`    file size = ${headerInfo.file_size} B`);
			this.log(`    records area size = ${headerInfo.records_size} B`);
			this.log(`    details area size = ${headerInfo.details_size} B`);
			this.log("    version:", headerInfo.version.readUInt8(2));
		}

		let records: IRecordCache | null = null;
		if (options.printRecords) {
			this.log("  Records Info:");
			records = fileParsingService.parse_records(file.buffer);
			const stats = records.stats;
			this.log(`    records area size = ${stats.records_area_size} B`);
			this.log(`    record count = ${stats.record_count} Records`);
			this.log(`    invalid records = ${stats.invalid_records}`);
			this.log(`    Records in File:`);
			this.print_type_count_table(stats.type_count, "      ");
		}

		if (options.printDetails) {
			this.log("  Details:");
			const details = fileInfoService.get_details(file.buffer);

			for (const key in details) {
				if (details.hasOwnProperty(key)) {
					this.log(`    ${key} = ${details[key]}`);
				}
			}
		}

		if (options.printDistribution) {
			if (records == null) {
				records = fileParsingService.parse_records(file.buffer);
			}
			this.log("  Record Distribution:");
			this.log(records.records.map((val) => val.type));
		}

		return this.getLog();
	}

	private log(...args: any[]) {
		const printed = args.map((val) => val.toString());
		this._logs.push(printed.join(" "));
	}

	private getLog(): string {
		return this._logs.join("\n");
	}

	private print_type_count_table(typeCount: { [type: number]: number; }, indent: string): void {
		const maxWidth = Object.keys(typeCount).reduce((acc, val) => {
			const name = RecordTypes[parseInt(val, 10)];
			if (name === undefined) { return acc; }
			return Math.max(acc, name.length);
		}, 0);

		// hacky way of aligning
		for (const key in typeCount) {
			if (typeCount.hasOwnProperty(key)) {
				let hexRep = parseInt(key, 10).toString(16);
				if (hexRep.length === 1) { hexRep = "0" + hexRep; }
				let part = `(${RecordTypes[key]})`;
				if (maxWidth - (part.length - 2) !== 0) {
					part += " ".repeat(maxWidth - part.length + 2);
				}
				console.log(`${indent}0x${hexRep}`, part, `= ${typeCount[key]}`);
			}
		}
	}
}
