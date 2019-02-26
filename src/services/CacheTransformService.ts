import BaseService from './BaseService'
import { IRecordCache, FileParsingService } from './FileParsingService';
import { ServiceTypes } from '../common/ServiceManager';
import { ScrambleTableService } from './ScrambleTableService';
import { IRecord } from './FileInfoService';
import * as _ from 'lodash';
import { BinaryParserService } from './BinaryParserService';
import { RecordTypes } from './RecordTypes';

export class CacheTransformService extends BaseService {
	
	public transform(records_cache: IRecordCache): Buffer 
	{
		const scramble_table_service = this.service_man.get_service(
      ServiceTypes.ScrambleTable
		) as ScrambleTableService;
		
		const file_parsing_service = this.service_man.get_service(
      ServiceTypes.FileParsing
		) as FileParsingService;

		const scrambled_rows = this.cache_as_rows(records_cache);
		
		const unscrambled_rows = _.map(scrambled_rows, (row) => {
			const new_row: any[] = [];
			_.forEach(row, (record) => {
				const unscrambled = scramble_table_service.unscramble_record(record);
				new_row.push(file_parsing_service.parse_record_by_type(unscrambled, record.type));
			});
			return new_row;
		});

		return Buffer.from(JSON.stringify(unscrambled_rows));
	}
	
	private cache_as_rows(records_cache: IRecordCache): IRecord[][]
	{
		const parser_service = this.service_man.get_service(ServiceTypes.Parsers) as BinaryParserService;
		
		const rows: IRecord[][] = [];
		const records = records_cache.records;

		let consumed = 0;
		let row: {[type: number]: IRecord} = {};
		
		while (consumed < records.length) {

			const record = records[consumed];

			// ignore the records for which we don't know the format
			if (parser_service.parser_record_mapping(record.type) == null) {
				consumed++;
				continue;
			}
			
			if (record.type != RecordTypes.OSD) {
				row[record.type] = record;
				consumed++;
				continue;
			}
			
			const row_arr: IRecord[] = [];
			_.forEach(row, (val) => row_arr.push(val));
			rows.push(row_arr);

			row = {};
			row[record.type] = record;
			consumed++;
		}

		return rows;
	}
}