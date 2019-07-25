import * as _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import BaseService from "./BaseService";
import { BinaryParserService, ParserTypes } from "./BinaryParserService";
import { FileInfoService, IHeaderInfo, IRecord } from "./FileInfoService";
import { RecordTypes } from "./RecordTypes";

function is_jpeg_soi(buffer: Buffer, offset: number): boolean {
	return (
		buffer.readUInt8(offset) === 0xff && buffer.readUInt8(offset + 1) === 0xd8
	);
}

function is_jpeg_eoi(buffer: Buffer, offset: number): boolean {
	return (
		buffer.readUInt8(offset) === 0xff && buffer.readUInt8(offset + 1) === 0xd9
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
	 * @param headerInfo The parsed values from the header part of the file.
	 */
	public parse_records(
		buffer: Buffer,
		headerInfo?: IHeaderInfo,
	): IRecordCache {
		if (headerInfo === undefined) {
			const fileInfoService = this.serviceMan.get_service(
				ServiceTypes.FileInfo,
			) as FileInfoService;
			headerInfo = fileInfoService.get_header_info(buffer);
		}

		const recordsBuff = buffer.slice(100);
		const limit = headerInfo.records_size;
		const records = this.get_record_cache(recordsBuff, limit, headerInfo.version);
		return records;
	}

	public filter_records(records: IRecordCache, type: RecordTypes): IRecord[] {
		const newCache: IRecord[] = [];
		records.records.forEach((val) => {
			if (val.type === type) {
				newCache.push(val);
			}
		});
		return newCache;
	}

	public parse_record_by_type(
		record: IRecord,
		recordType: RecordTypes,
	): any {
		const parserService = this.serviceMan.get_service(
			ServiceTypes.Parsers,
		) as BinaryParserService;

		return parserService.get_record_parser(recordType).parse(record.data);
	}

	private get_record_cache(buffer: Buffer, limit: number, version: Buffer): IRecordCache {
		const parserService = this.serviceMan.get_service(
			ServiceTypes.Parsers,
		) as BinaryParserService;

		const recordParser = parserService.get_parser(ParserTypes.BaseRecord);
		const recordStartParser = parserService.get_parser(
			ParserTypes.StartRecord,
		);

		const recordCache: IRecordCache = {
			records: [],
			version,
			stats: {
				records_area_size: buffer.length,
				record_count: 0,
				type_count: {},
				invalid_records: 0,
			},
		};

		let start = 0;
		while (start < limit) {
			const recStart = recordStartParser.parse(buffer.slice(start));

			let record;
			if (recStart.type === RecordTypes.JPEG) {
				// check for starting zeros
				const zeroWatermarkLo = buffer.readUInt8(start + 2);
				const zeroWatermarkHi = buffer.readUInt8(start + 3);

				if ((zeroWatermarkHi | zeroWatermarkLo) !== 0) {
					throw Error("No zero watermark while parsing jpeg record");
				}

				if (!is_jpeg_soi(buffer, start + 4)) {
					record = {
						type: RecordTypes.JPEG,
						length: recStart.length,
						data: [],
					};
					start += 4;
				} else {
					// todo: handle jpeg record with jpegs in them
				}
			} else {
				record = recordParser.parse(buffer.slice(start));
				start += record.length + 3;
			}

			this.calc_stats(recordCache, record);
		}

		return recordCache;
	}

	private calc_stats(cache: IRecordCache, record: any) {
		cache.records.push(record);
		cache.stats.record_count += 1;

		if (record.type !== RecordTypes.JPEG && record.marker !== 0xff) {
			cache.stats.invalid_records += 1;
			return;
		}

		if (cache.stats.type_count[record.type] === null) {
			cache.stats.type_count[record.type] = 1;
			return;
		}

		cache.stats.type_count[record.type] += 1;
	}
}
