import { ServiceTypes } from "../common/ServiceManager";
import { IRecordCache } from "../shared/interfaces";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { Command } from "./Command";

export interface IUnscrambleOptions {
	records: IRecordCache;
}

export class UnscrambleCommand extends Command<IUnscrambleOptions, IRecordCache> {
	public exec(options: IUnscrambleOptions): IRecordCache {
		const serviceMan = this.serviceMan;

		const scrambleTableService = serviceMan.get_service<ScrambleTableService>(
			ServiceTypes.ScrambleTable,
		);

		const recordsCache = options.records;
		recordsCache.records = recordsCache.records.map((val) => scrambleTableService.unscramble_record(val));
		return recordsCache;
	}
}
