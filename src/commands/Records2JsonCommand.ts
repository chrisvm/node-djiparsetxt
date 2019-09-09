import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { IRecordCache } from "../shared/interfaces";
import { Command } from "./Command";

export interface IRecords2JsonOptions {
	prettyPrint: boolean;
	output: string | null;
	records: IRecordCache;
}

export class Records2JsonCommand extends Command<IRecords2JsonOptions, string> {
	public exec(options: IRecords2JsonOptions): string {
		const serviceMan = this.serviceMan;

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		cacheTransService.unscramble(recordsCache);
		const unscrambledRows = cacheTransService.cache_as_rows(recordsCache);
		const parsedRows = cacheTransService.rows_to_json(unscrambledRows);

		let output: string;
		if (options.prettyPrint) {
			output = JSON.stringify(parsedRows, null, 2);
		} else {
			output = JSON.stringify(parsedRows);
		}

		return output;
	}
}
