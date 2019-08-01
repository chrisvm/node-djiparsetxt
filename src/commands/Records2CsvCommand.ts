import _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService, IRowObject } from "../services/CacheTransformService";
import { IRecordCache } from "../services/FileParsingService";
import { Command } from "./Command";

export interface IRecords2CsvOptions {
	output: string | null;
	records: IRecordCache;
}

interface IRowHeader {
	type: string;
	props: string[];
}

const RECORD_ORDER: string[] = [
	"CUSTOM",
	"OSD",
	"HOME",
	"GIMBAL",
	"RC",
	"DEFORM",
	"CENTER_BATTERY",
	"SMART_BATTERY",
	"APP_TIP",
	"APP_WARN",
	"RC_GPS",
	"RC_DEBUG",
	"RECOVER",
	"APP_GPS",
	"FIRMWARE",
	"OFDM_DEBUG",
	"VISION_GROUP",
	"VISION_WARN",
	"MC_PARAM",
	"APP_OPERATION",
	"APP_SER_WARN",
	// "JPEG",
	"OTHER",
];

export class Records2CsvCommand extends Command<IRecords2CsvOptions, string> {
	public exec(options: IRecords2CsvOptions): string {
		const serviceMan = this.serviceMan;

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		const recordsCache = options.records;
		cacheTransService.unscramble(recordsCache);
		const unscrambledRows = cacheTransService.cache_as_rows(recordsCache);
		const parsedRows = cacheTransService.rows_to_json(unscrambledRows);

		// print json object to csv representation
		const headerDef = this.getRowHeaders(parsedRows);
		this.printHeader(headerDef);
		this.printRowValues(parsedRows, headerDef);

		return this.getLog();
	}

	private printHeader(headerDef: IRowHeader[]): void {
		const headers: string[] = [];
		for (const header of headerDef) {
			for (const prop of header.props) {
				headers.push(`${header.type}.${prop}`);
			}
		}
		this.log(headers.join(","));
	}

	private getRowHeaders(rows: IRowObject[]): IRowHeader[] {
		const presentTypes = new Set<string>();
		const typeProps: { [type: string]: string[] } = {};

		for (const row of rows) {
			for (const type of _.keys(row)) {
				presentTypes.add(type);
				typeProps[type] = _.keys(row[type]);
			}
		}

		const headers: IRowHeader[] = [];
		for (const type of RECORD_ORDER) {
			if (presentTypes.has(type)) {
				const props = typeProps[type];
				headers.push({ type, props });
			}
		}

		return headers;
	}

	private printRowValues(rows: IRowObject[], headerDef: IRowHeader[]): void {
		for (const datarow of rows) {
			const values: string[] = [];
			for (const header of headerDef) {
				for (const prop of header.props) {
					const path = `${header.type}.${prop}`;
					if (_.has(datarow, path)) {
						values.push(_.get(datarow, path).toString());
					} else {
						values.push("");
					}
				}
			}
			this.log(values.join(","));
		}
	}
}
