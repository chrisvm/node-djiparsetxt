import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { CsvService } from "../services/CsvService";
import { IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";

export interface IRecords2CsvOptions {
	output: string | null;
	records: IRecordCache;
}

export class Records2CsvCommand extends Command<IRecords2CsvOptions, string> {

	public exec(options: IRecords2CsvOptions): string {
		const serviceMan = this.serviceMan;

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const csvService = serviceMan.get_service<CsvService>(ServiceTypes.CsvService);

		const recordsCache = options.records;
		cacheTransService.unscramble(recordsCache);
		const unscrambledRows = cacheTransService.cache_as_rows(recordsCache);
		const parsedRows = cacheTransService.rows_to_json(unscrambledRows);

		// print json object to csv representation
		const headerDef = csvService.getRowHeaders(parsedRows);
		this.log(csvService.createHeader(headerDef));
		this.log(csvService.printRowValues(parsedRows, headerDef));

		return this.getLog();
	}
}
