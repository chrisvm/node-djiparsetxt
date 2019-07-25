import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { FileInfoService } from "../services/FileInfoService";
import { FileParsingService } from "../services/FileParsingService";
import { FilesService } from "../services/FilesService";
import { RecordTypes } from "../services/RecordTypes";
import { ICommand } from "./ICommand";

export class PrintInfoCommand implements ICommand {

	public exec(serviceMan: ServiceManager): void {
		const filesService = serviceMan.get_service<FilesService>(ServiceTypes.Files);
		const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
		const fileParsingService = serviceMan.get_service<FileParsingService>(ServiceTypes.FileParsing);

		if (filesService) {
			filesService.files((file) => {
				// show header details
				console.log(`file "${file.path}"`);
				if (serviceMan.argv.print_header) {
					const headerInfo = fileInfoService.get_header_info(file.buffer);
					console.log("  Header Info:");
					console.log(`    file size = ${headerInfo.file_size} B`);
					console.log(`    records area size = ${headerInfo.records_size} B`);
					console.log(`    details area size = ${headerInfo.details_size} B`);
					console.log("    version:", headerInfo.version.readUInt8(2));
				}

				let records = null;
				if (serviceMan.argv.print_records) {
					console.log("  Records Info:");
					records = fileParsingService.parse_records(file.buffer);
					const stats = records.stats;
					console.log(`    records area size = ${stats.records_area_size} B`);
					console.log(`    record count = ${stats.record_count} Records`);
					console.log(`    invalid records = ${stats.invalid_records}`);
					console.log(`    Records in File:`);
					this.print_type_count_table(stats.type_count, "      ");
				}

				if (serviceMan.argv.details) {
					console.log("  Details:");
					const details = fileInfoService.get_details(file.buffer);

					for (const key in details) {
						if (details.hasOwnProperty(key)) {
							console.log(`    ${key} = ${details[key]}`);
						}
					}
				}

				if (serviceMan.argv.distrib) {
					if (records == null) {
						records = fileParsingService.parse_records(file.buffer);
					}
					console.log("  Record Distribution:");
					console.log(records.records.map((val) => val.type));
				}
			});
		}
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
