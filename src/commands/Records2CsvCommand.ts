import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { FileParsingService, IRecordCache } from "../services/FileParsingService";
import { RecordTypes } from "../services/RecordTypes";
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
		cacheTransService.unscramble(recordsCache);
		const unscrambledRows = cacheTransService.cache_as_rows(recordsCache);

		const parsedRows = cacheTransService.rows_to_json(unscrambledRows);
		return "";
	}
}
