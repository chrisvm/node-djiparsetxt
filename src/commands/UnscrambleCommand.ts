import * as _ from "lodash";
import path from "path";
import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { FileInfoService } from "../services/FileInfoService";
import { FileParsingService } from "../services/FileParsingService";
import { FilesService } from "../services/FilesService";
import { RecordTypes } from "../services/RecordTypes";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { Command } from "./Command";

export class UnscrambleCommand implements Command {
	public exec(serviceMan: ServiceManager): void {
		const filesService = serviceMan.get_service<FilesService>(
			ServiceTypes.Files
		);
		const fileParsingService = serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing
		);
		const scrambleTableService = serviceMan.get_service<ScrambleTableService>(
			ServiceTypes.ScrambleTable
		);

		for (const file of filesService.files) {
			const recordsCache = fileParsingService.parse_records(file.buffer);

			recordsCache.records = recordsCache.records.map((val) => scrambleTableService.unscramble_record(val));

			const unscrambledBuf = Buffer.alloc(file.buffer.length);
			file.buffer.copy(unscrambledBuf, 0, 0, 100);

			let offset = 100;

			for (const record of recordsCache.records) {

				unscrambledBuf.writeUInt8(record.type, offset++);
				unscrambledBuf.writeUInt8(record.length, offset++);

				// jpeg records dont have scrambling, treat accordingly
				if (record.type !== RecordTypes.JPEG) {
					for (const buff of record.data) {
						buff.copy(unscrambledBuf, offset);
						offset += buff.length;
					}
					unscrambledBuf.writeUInt8(0xff, offset++);
				} else {
					unscrambledBuf.writeUInt8(0, offset++);
					unscrambledBuf.writeUInt8(0, offset++);
					for (const buf of record.data) {
						for (let ii = 0; ii < buf.length; ii++) {
							unscrambledBuf.writeUInt8(buf[ii], offset++);
						}
					}
				}
			}

			file.buffer.copy(unscrambledBuf, offset, offset);

			let outFile = file.path + ".unscrambled";

			if (serviceMan.argv.output != null) {
				const basename = path.basename(outFile);
				outFile = path.join(serviceMan.argv.output, basename);
			}

			filesService.writeFile(outFile, unscrambledBuf);
		}
	}
}
