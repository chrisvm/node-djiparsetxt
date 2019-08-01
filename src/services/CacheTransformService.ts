import { ServiceTypes } from "../common/ServiceManager";
import BaseService from "./BaseService";
import { BinaryParserService } from "./BinaryParserService";
import { IRecord } from "./FileInfoService";
import { FileParsingService, IRecordCache } from "./FileParsingService";
import { RecordTypes } from "./RecordTypes";
import { ScrambleTableService } from "./ScrambleTableService";

export interface IRowObject { [type: string]: any; }

export class CacheTransformService extends BaseService {

	public unscramble(recordsCache: IRecordCache): void {
		const scrambleTableService = this.serviceMan.get_service<ScrambleTableService>(
			ServiceTypes.ScrambleTable,
		);

		recordsCache.records = recordsCache.records.map((rec) => scrambleTableService.unscramble_record(rec));
	}

	public cache_as_rows(recordsCache: IRecordCache): IRecord[][] {
		const parserService = this.serviceMan.get_service<BinaryParserService>(ServiceTypes.Parsers);

		const rows: IRecord[][] = [];
		const records = recordsCache.records;

		let consumed = 0;
		let row: IRecord[] = [];

		while (consumed < records.length) {

			const record = records[consumed];

			// ignore the records for which we don't know the format
			if (parserService.parser_record_mapping(record.type) === null) {
				consumed++;
				continue;
			}

			// we create a row for each OSD record type
			if (record.type !== RecordTypes.OSD) {
				row.push(record);
				consumed++;
				continue;
			}

			if (row.length > 0) {
				rows.push(row);
			}

			row = [record];
			consumed++;
		}

		return rows;
	}

	public rows_to_json(rows: IRecord[][]): IRowObject[] {
		const fileParsingService = this.serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const row2json = (row: IRecord[]): IRowObject => {
			const newRow: IRowObject = {};
			for (const record of row) {
				newRow[RecordTypes[record.type]] = fileParsingService.parse_record_by_type(record, record.type);
			}
			return newRow;
		};

		return rows.map(row2json);
	}
}
