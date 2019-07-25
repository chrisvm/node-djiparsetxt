import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { FileInfoService } from "../services/FileInfoService";
import { FileParsingService } from "../services/FileParsingService";
import { FilesService } from "../services/FilesService";
import { RecordTypes } from "../services/RecordTypes";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { ICommand } from "./ICommand";

export class UnscrambleCommand implements ICommand {

	public exec(serviceMan: ServiceManager): void {
		const filesService = serviceMan.get_service<FilesService>(ServiceTypes.Files);
		const fileInfoService = serviceMan.get_service<FileInfoService>(ServiceTypes.FileInfo);
		const fileParsingService = serviceMan.get_service<FileParsingService>(ServiceTypes.FileParsing);

		const scrambleTableService = serviceMan.get_service<ScrambleTableService>(
			ServiceTypes.ScrambleTable,
		);

		filesService.files((file) => {
			const recordHeader = fileInfoService.get_header_info(file.buffer);
			const recordsCache = fileParsingService.parse_records(file.buffer);

			recordsCache.records = recordsCache.records.map((val) => {
				if (val.type === RecordTypes.JPEG) { return val; }
				return scrambleTableService.unscramble_record(val);
			});

			const unscrambledBuf = new Buffer(file.buffer.length);
			file.buffer.copy(unscrambledBuf, 0, 0, 100);

			let offset = 100;
			let recordIndex = 0;
			const recordsHeaderSize = recordHeader.records_size + recordHeader.header_size;

			while (offset < recordsHeaderSize) {
				const record = recordsCache.records[recordIndex++];
				unscrambledBuf.writeUInt8(record.type, offset++);
				unscrambledBuf.writeUInt8(record.length, offset++);

				// jpeg records dont have scrambling, treat accordingly
				if (record.type !== RecordTypes.JPEG) {
					record.data.copy(unscrambledBuf, offset);
					offset += record.length;
					unscrambledBuf.writeUInt8(0xFF, offset++);
				} else {
					unscrambledBuf.writeUInt8(0, offset++);
					unscrambledBuf.writeUInt8(0, offset++);
					// todo: deal with jpeg images
				}
			}

			file.buffer.copy(unscrambledBuf, offset, offset);

			let outFile = file.path + ".unscrambled";

			if (serviceMan.argv.output != null) {
				outFile = serviceMan.argv.output;
			}

			filesService.write_file(outFile, unscrambledBuf);
		});
	}
}
