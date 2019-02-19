import BaseService from "./BaseService";
import { RecordTypes } from "./RecordTypes";
import { get_scramble_table } from "./ScrambleTable";
import { IRecord } from "./FileInfoService";

export class ScrambleTableService extends BaseService {

	private _scramble_table: number[][] = [];

	public get scramble_table() {
		if (this._scramble_table.length == 0) {
			this._scramble_table = get_scramble_table();
		}
		return this._scramble_table;
	}

	public unscramble_record(record: IRecord): IRecord 
  {
		let data = this.unscramble_buffer(record.data, record.type);
		if (data == null) data = record.data;
    return {
      type: record.type,
      length: record.length,
      data: data
    };
  }

	private unscramble_buffer(buf: Buffer, type: RecordTypes): Buffer | null {
		const first_byte = buf.readUInt8(0);
		const scramble_key = first_byte | ((type - 1) << 8);
		const scramble_bytes = this.scramble_table[scramble_key];

		if (scramble_bytes == undefined) {
			return null;
		}

		const unscrambled_buf = Buffer.alloc(buf.length);

		// write first byte which was already unscrambled
		unscrambled_buf.writeUInt8(first_byte, 0);

		for (let write_offset = 1; write_offset < buf.length; write_offset++) {
			const scramble_entry = scramble_bytes[write_offset - (1 % 8)];
			const val =	buf.readUInt8(write_offset) ^ scramble_entry;
			unscrambled_buf.writeUInt8(val, write_offset);
		}

		return unscrambled_buf;
	}
}
