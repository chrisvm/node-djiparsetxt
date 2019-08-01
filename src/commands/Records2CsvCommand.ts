import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { FileParsingService, IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";

export interface IRecords2CsvOptions {
	output: string | null;
	records: IRecordCache;
}

export class Records2CsvCommand extends Command<IRecords2CsvOptions, string> {
	public exec(options: IRecords2CsvOptions): string {
		const serviceMan = this.serviceMan;

		const fileParsingService = serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		const rows = cacheTransService.unscramble(recordsCache);

		const parsedRows = _.map(rows, (row) => {
			const newRow: any[] = [];
			for (const record of row) {
				newRow.push(fileParsingService.parse_record_by_type(record, record.type));
			}
			return newRow;
		});
		return "";
	}
}
