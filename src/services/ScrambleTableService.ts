import BaseService from "./BaseService";
import { IRecord } from "../shared/interfaces";
import { RecordTypes } from "./RecordTypes";
import { scrambleTable } from "./ScrambleTable";
export class ScrambleTableService extends BaseService {
	private _scrambleTable: number[][] = [];

	public get scrambleTable() {
		if (this._scrambleTable.length === 0) {
			this._scrambleTable = scrambleTable;
		}
		return this._scrambleTable;
	}

	public unscramble_record(record: IRecord): IRecord {
		let data: Buffer[];

		if (record.type === RecordTypes.JPEG) {
			data = record.data;
		} else {
			const uscrm = this.unscramble_buffer(record.data[0], record.type);
			if (uscrm == null) {
				data = record.data;
			} else {
				data = uscrm;
			}
		}

		return {
			type: record.type,
			length: record.length,
			data,
		};
	}

	private unscramble_buffer(buf: Buffer, type: RecordTypes): Buffer[] | null {
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

		return [unscrambledBuf];
	}
}
