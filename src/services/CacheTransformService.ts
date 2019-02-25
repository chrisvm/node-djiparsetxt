import BaseService from './BaseService'
import { IRecordCache } from './FileParsingService';
import { ServiceTypes } from '../common/ServiceManager';
import { ScrambleTableService } from './ScrambleTableService';
import { IRecord } from './FileInfoService';
import * as _ from 'lodash';
import { BinaryParserService } from './BinaryParserService';

export class CacheTransformService extends BaseService {
	
	public transform(records_cache: IRecordCache): Buffer 
	{
		const scramble_table_service = this.service_man.get_service(
      ServiceTypes.ScrambleTable
		) as ScrambleTableService;
		
		const rows = this.cache_as_rows(records_cache);
		console.log(rows);

		return Buffer.from("Method not implemented.");
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

			if (parser_service.parser_record_mapping(record.type) == null) {
				consumed++;
				continue;
			}
			
			if (row[record.type] == null) {
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