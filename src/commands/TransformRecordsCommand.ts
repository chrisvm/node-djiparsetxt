import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";

export interface ITransformOptions {
	prettyPrint: boolean;
	output: string | null;
	records: IRecordCache;
}

export class TransformRecordsCommand extends Command<ITransformOptions, string> {
	public exec(options: ITransformOptions): string {
		const serviceMan = this.serviceMan;

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		const rows = cacheTransService.transform(recordsCache);

		let output: string;
		if (options.prettyPrint) {
			output = JSON.stringify(rows, null, 2);
		} else {
			output = JSON.stringify(rows);
		}

		return output;
	}
}
