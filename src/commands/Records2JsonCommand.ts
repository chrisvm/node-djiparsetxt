import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { FileParsingService, IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";
import { RecordTypes } from "../services/RecordTypes";

export interface IRecords2JsonOptions {
	prettyPrint: boolean;
	output: string | null;
	records: IRecordCache;
}

export class Records2JsonCommand extends Command<IRecords2JsonOptions, string> {
	public exec(options: IRecords2JsonOptions): string {
		const serviceMan = this.serviceMan;

		const fileParsingService = serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		const unscrambledRows = cacheTransService.unscramble(recordsCache);

		const parsedRows = _.map(unscrambledRows, (row) => {
			const newRow: { [type: string]: any; } = {};
			for (const record of row) {
				newRow[RecordTypes[record.type]] = fileParsingService.parse_record_by_type(record, record.type);
			}
			return newRow;
		});

		let output: string;
		if (options.prettyPrint) {
			output = JSON.stringify(parsedRows, null, 2);
		} else {
			output = JSON.stringify(parsedRows);
		}

		return output;
	}
}
