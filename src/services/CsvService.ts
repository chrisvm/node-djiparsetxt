import _ from "lodash";
import { IRowObject, IRowHeader } from "../shared/interfaces";
import BaseService from "./BaseService";


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

	/**
	 * Create header rows data for csv production. Each row object contains properties
	 * that are stored to be able to create a header of the form 'row.property'.
	 * @param rows Array of rows to extract the header info from. 
	 */
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

	/**
	 * Prints the given rows in `rows` in csv format.
	 * @param rows Array of rows to print the values of.
	 * @param headerDef The header definition already extracted from the rows.
	 */
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

	/**
	 * Prints the header for the first line of the csv file.
	 * @param headerDef The header definiton to print.
	 */
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
