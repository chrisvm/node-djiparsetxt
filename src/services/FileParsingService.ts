import * as _ from "lodash";
import { ServiceTypes } from "../common/ServiceManager";
import { Version } from "../common/Version";
import BaseService from "./BaseService";
import { BinaryParserService, ParserTypes } from "./BinaryParserService";
import { FileInfoService } from "./FileInfoService";
import { RecordTypes } from "./RecordTypes";
import { IHeaderInfo, IRecord, IRecordCache } from "../shared/interfaces";



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
		return records.records.filter((val) => val.type === type);
	}

	public createEmptyCache(): IRecordCache {
		const version = Version.CreateEmpty();

		return {
			records: [],
			version,
			isEmpty: true,
			stats: {
				records_area_size: 0,
				record_count: 0,
				type_count: {},
				invalid_records: 0,
			},
		};
	}

	public parse_record_by_type(
		record: IRecord,
		recordType: RecordTypes,
	): any {
		const parserService = this.serviceMan.get_service<BinaryParserService>(ServiceTypes.Parsers);
		try {
			return parserService.get_record_parser(recordType).parse(record.data[0]);
		} catch (e) {
			console.log(`Record type ${RecordTypes[recordType]} had error parsing`);
			throw e;
		}
	}

	private get_record_cache(buffer: Buffer, limit: number, version: Version): IRecordCache {
		const parserService = this.serviceMan.get_service<BinaryParserService>(ServiceTypes.Parsers);
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

			let record: IRecord | null;
			if (recStart.type === RecordTypes.JPEG) {
				// check for starting zeros
				const zeroWatermarkLo = buffer.readUInt8(start + 2);
				const zeroWatermarkHi = buffer.readUInt8(start + 3);

				if ((zeroWatermarkHi | zeroWatermarkLo) !== 0) {
					throw Error("No zero watermark while parsing jpeg record");
				}

				if (is_jpeg_soi(buffer, start + 4)) {
					// handle jpeg record with jpegs in them
					const jpegs = [];
					let startOfJpeg = start + 4;
					let endOfJpeg = startOfJpeg;

					while (is_jpeg_soi(buffer, startOfJpeg)) {
						endOfJpeg = this.getJpegEoiIndex(buffer, startOfJpeg + 2);

						if (endOfJpeg === -1) {
							throw new Error("No JPEG_EOI found after JPEG_SOI");
						}

						jpegs.push(buffer.slice(startOfJpeg, endOfJpeg));
						startOfJpeg = endOfJpeg;
					}

					record = {
						type: RecordTypes.JPEG,
						length: recStart.length,
						data: jpegs,
					};

					start = endOfJpeg;
				} else {
					// handle an empty jpeg record
					record = {
						type: RecordTypes.JPEG,
						length: recStart.length,
						data: [Buffer.alloc(0)],
					};
					start += 4;
				}
			} else {
				const parsedRecord = recordParser.parse(buffer.slice(start));
				record = {
					length: parsedRecord.length,
					type: parsedRecord.type,
					data: [parsedRecord.data],
				};
				start += record.length + 3;
			}

			if (record !== null) {
				this.addRecordToCache(recordCache, record);	
			}
		}

		return recordCache;
	}

	private getJpegEoiIndex(buffer: Buffer, index: number): number {
		let iter = index;
		while (iter < buffer.length - 1) {
			if (is_jpeg_eoi(buffer, iter)) {
				return iter + 2;
			}
			iter += 1;
		}
		return -1;
	}

	private addRecordToCache(cache: IRecordCache, record: any) {
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
