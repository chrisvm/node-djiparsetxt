import { RecordTypes } from "../services/RecordTypes";
import { Command } from "./Command";
import { IFile, IRecordCache } from "../shared/interfaces";

export interface ISerializeRecordsOptions {
	file: IFile;
	records: IRecordCache;
}

export class SerializeRecordsCommand extends Command<ISerializeRecordsOptions, Buffer> {
	public exec(options: ISerializeRecordsOptions): Buffer {
		const file = options.file;
		const recordsCache = options.records;

		if (file.buffer === null) {
			return Buffer.alloc(0);
		}

		const unscrambledBuf = Buffer.alloc(file.buffer.length);
		file.buffer.copy(unscrambledBuf, 0, 0, 100);

		let offset = 100;

		for (const record of recordsCache.records) {

			unscrambledBuf.writeUInt8(record.type, offset++);
			unscrambledBuf.writeUInt8(record.length, offset++);

			// jpeg records don't have scrambling, treat accordingly
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
		return unscrambledBuf;
	}
}
