import BaseService from "./BaseService";
import * as _ from "lodash";
import { RecordTypes } from "./RecordTypes";
import { BinaryParserService, ParserTypes } from "./BinaryParserService";
import { FileInfoService, IHeaderInfo, IRecord } from "./FileInfoService";
import { ServiceTypes } from "../common/ServiceManager";

function is_jpeg_soi(buffer: Buffer, offset: number): boolean {
	return (
		buffer.readUInt8(offset) == 0xff && buffer.readUInt8(offset + 1) == 0xd8
	);
}

function is_jpeg_eoi(buffer: Buffer, offset: number): boolean {
	return (
		buffer.readUInt8(offset) == 0xff && buffer.readUInt8(offset + 1) == 0xd9
	);
}

export interface IRecordStats {
	records_area_size: number;
	record_count: number;
	type_count: { [type: number]: number };
	invalid_records: number;
}

export interface IRecordCache {
	records: IRecord[];
	version: Buffer;
	stats: IRecordStats;
}

export class FileParsingService extends BaseService {
	public name: string = "file_parsing";

	/**
	 * Parses the
	 * @param buffer File buffer to parse.
	 * @param header_info The parsed values from the header part of the file.
	 */
	public parse_records(
		buffer: Buffer,
		header_info?: IHeaderInfo
	): IRecordCache {
		if (header_info == undefined) {
			const file_info_service = this.service_man.get_service(
				ServiceTypes.FileInfo
			) as FileInfoService;
			header_info = file_info_service.get_header_info(buffer);
		}

		const records_buff = buffer.slice(100);
		let limit = header_info.records_size;
		const records = this.get_record_cache(records_buff, limit, header_info.version);
		return records;
	}

	public filter_records(records: IRecordCache, type: RecordTypes): IRecord[] {
		const new_cache: IRecord[] = [];
		records.records.forEach(val => {
			if (val.type == type) {
				new_cache.push(val);
			}
		});
		return new_cache;
	}

	public parse_record_by_type(
		record: IRecord,
		record_type: RecordTypes
	): any {
		const parser_service = this.service_man.get_service(
			ServiceTypes.Parsers
		) as BinaryParserService;

		return parser_service.get_record_parser(record_type).parse(record.data);
	}

	private get_record_cache(buffer: Buffer, limit: number, version: Buffer): IRecordCache {
		const parser_service = this.service_man.get_service(
			ServiceTypes.Parsers
		) as BinaryParserService;

		const record_parser = parser_service.get_parser(ParserTypes.BaseRecord);
		const record_start_parser = parser_service.get_parser(
			ParserTypes.StartRecord
		);

		const record_cache: IRecordCache = {
			records: [],
			version: version,
			stats: {
				records_area_size: buffer.length,
				record_count: 0,
				type_count: {},
				invalid_records: 0
			}
		};

		let start = 0;
		while (start < limit) {
			const rec_start = record_start_parser.parse(buffer.slice(start));

			let record;
			if (rec_start.type == RecordTypes.JPEG) {
				// check for starting zeros
				const zero_watermark_lo = buffer.readUInt8(start + 2);
				const zero_watermark_hi = buffer.readUInt8(start + 3);

				if ((zero_watermark_hi | zero_watermark_lo) != 0) {
					throw Error("No zero watermark while parsing jpeg record");
				}

				if (!is_jpeg_soi(buffer, start + 4)) {
					record = {
						type: RecordTypes.JPEG,
						length: rec_start.length,
						data: []
					};
					start += 4;
				} else {
					// todo: handle jpeg record with jpegs in them
				}
			} else {
				record = record_parser.parse(buffer.slice(start));
				start += record.length + 3;
			}

			this.calc_stats(record_cache, record);
		}

		return record_cache;
	}

	private calc_stats(cache: IRecordCache, record: any) {
		cache.records.push(record);
		cache.stats.record_count += 1;

		if (record.type != RecordTypes.JPEG && record.marker != 0xff) {
			cache.stats.invalid_records += 1;
			return;
		}

		if (cache.stats.type_count[record.type] == null) {
			cache.stats.type_count[record.type] = 1;
			return;
		}

		cache.stats.type_count[record.type] += 1;
	}
}
