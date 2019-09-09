import fs from "fs";
import { IRecordCache } from "../shared/interfaces";
import { RecordTypes } from "../services/RecordTypes";
import { Command } from "./Command";

export interface IJpegExtractOptions {
	records: IRecordCache;
}

export class JpegExtractCommand extends Command<IJpegExtractOptions, void> {
	public exec(options: IJpegExtractOptions): void {
		const recordsCache = options.records;
		for (const record of recordsCache.records) {
			if (record.type === RecordTypes.JPEG) {
				let index = 0;
				for (const buf of record.data) {
					const path = `jpeg_${index}.jpeg`;
					fs.writeFileSync(path, buf);
					console.log(`Wrote ${path} to disk`);
					index += 1;
				}
			}
		}
	}
}
