import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";

export interface ITransformOptions {
	prettyPrint: boolean;
	output: string | null;
	records: IRecordCache;
}

export class TransformRecordsCommand extends Command<ITransformOptions, void> {
	public exec(options: ITransformOptions): void {
		const serviceMan = this.serviceMan;

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		const outputBuf = cacheTransService.transform(recordsCache);

		let output: string;
		if (options.prettyPrint) {
			output = JSON.stringify(outputBuf, null, 2);
		} else {
			output = JSON.stringify(outputBuf);
		}

		if (options.output) {
			// todo: work with the --output option
		} else {
			console.log(output);
		}
	}
}
