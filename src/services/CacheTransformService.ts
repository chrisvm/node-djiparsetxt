import * as _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import BaseService from "./BaseService";
import { BinaryParserService } from "./BinaryParserService";
import { IRecord } from "./FileInfoService";
import { FileParsingService, IRecordCache } from "./FileParsingService";
import { RecordTypes } from "./RecordTypes";
import { ScrambleTableService } from "./ScrambleTableService";

export class CacheTransformService extends BaseService {

	public transform(recordsCache: IRecordCache): any[][] {
		const scrambleTableService = this.serviceMan.get_service<ScrambleTableService>(
			ServiceTypes.ScrambleTable,
		);

		const fileParsingService = this.serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const scrambledRows = this.cache_as_rows(recordsCache);

		const unscrambledRows = _.map(scrambledRows, (row) => {
			const newRow: any[] = [];
			for (const record of row) {
				const unscrambled = scrambleTableService.unscramble_record(record);
				newRow.push(fileParsingService.parse_record_by_type(unscrambled, record.type));
			}
			return newRow;
		});

		return unscrambledRows;
	}

	private cache_as_rows(recordsCache: IRecordCache): IRecord[][] {
		const parserService = this.serviceMan.get_service<BinaryParserService>(ServiceTypes.Parsers);

		const rows: IRecord[][] = [];
		const records = recordsCache.records;

		let consumed = 0;
		let row: {[type: number]: IRecord} = {};

		while (consumed < records.length) {

			const record = records[consumed];

			// ignore the records for which we don't know the format
			if (parserService.parser_record_mapping(record.type) === null) {
				consumed++;
				continue;
			}

			if (record.type !== RecordTypes.OSD) {
				row[record.type] = record;
				consumed++;
				continue;
			}

			const rowArr: IRecord[] = [];

			for (const val in row) {
				if (row.hasOwnProperty(val)) {
					rowArr.push(row[val]);
				}
			}
			rows.push(rowArr);

			row = {};
			row[record.type] = record;
			consumed++;
		}

		return rows;
	}
}
