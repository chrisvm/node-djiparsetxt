import BaseService from "./BaseService";
import { IRecord } from "./FileInfoService";
import { RecordTypes } from "./RecordTypes";
import { get_scramble_table } from "./ScrambleTable";

export class ScrambleTableService extends BaseService {
	private _scrambleTable: number[][] = [];

	public get scrambleTable() {
		if (this._scrambleTable.length === 0) {
			this._scrambleTable = get_scramble_table();
		}
		return this._scrambleTable;
	}

	public unscramble_record(record: IRecord): IRecord {
		let data = this.unscramble_buffer(record.data[0], record.type);
		if (data == null) { data = record.data[0]; }
		return {
			type: record.type,
			length: record.length,
			data: [data],
		};
	}

	private unscramble_buffer(buf: Buffer, type: RecordTypes): Buffer | null {
		const firstByte = buf.readUInt8(0);
		const scrambleKey = ((type - 1) << 8) | firstByte;
		const scrambleBytes = this.scrambleTable[scrambleKey];

		if (scrambleBytes === undefined) {
			return null;
		}

		const unscrambledBuf = Buffer.alloc(buf.length - 1);

		for (let writeOffset = 1; writeOffset < buf.length; writeOffset++) {
			const scrambleEntry = scrambleBytes[(writeOffset - 1) % 8];
			const val = buf.readUInt8(writeOffset) ^ scrambleEntry;
			unscrambledBuf.writeUInt8(val, writeOffset - 1);
		}

		return unscrambledBuf;
	}
}
