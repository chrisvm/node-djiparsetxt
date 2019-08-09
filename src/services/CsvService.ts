import _ from "lodash";
import { IRowObject } from "../services/CacheTransformService";
import BaseService from "./BaseService";

export interface IRowHeader {
	type: string;
	props: string[];
}

export const RECORD_ORDER: string[] = [
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

export class CsvService extends BaseService {
	public getRowHeaders(rows: IRowObject[]): IRowHeader[] {
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

	public printRowValues(rows: IRowObject[], headerDef: IRowHeader[]): string {
		const lines: string[] = [];
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
			lines.push(values.join(","));
		}
		return lines.join("\n");
	}

	public createHeader(headerDef: IRowHeader[]): string {
		const headers: string[] = [];
		for (const header of headerDef) {
			for (const prop of header.props) {
				headers.push(`${header.type}.${prop}`);
			}
		}
		return headers.join(",");
	}
}
