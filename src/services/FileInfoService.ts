import BaseService from "./BaseService";
import { RecordStats, FileParsingService } from "./FileParsingService";
import {
	BinaryParserService,
	ParserTypes,
	bignum_convert_buffer
} from "./BinaryParserService";
import { RecordTypes } from "./RecordTypes";

export interface HeaderInfo {
	file_size: number;
	header_size: number;
	records_size: number;
	details_size: number;
	version: number;
}

export interface FileInfo {
	header_info: HeaderInfo;
	records_info: RecordStats;
}

export interface IRecord
{
  type: RecordTypes;
  length: number;
  data: Buffer;
}

export class FileInfoService extends BaseService {
	public name: string = "file_info";

	public get_header_info(buffer: Buffer): HeaderInfo {
		const parser_service = this.service_man.get_service(
			"parsers"
		) as BinaryParserService;
		const header_parser = parser_service.get_parser(ParserTypes.Header);

		// get first 100 bytes and parse them.
		const header_buff = buffer.slice(0, 100);
		const header = header_parser.parse(header_buff);

		// calculate details
		const file_size = buffer.length;
		const header_records_area_size = header.header_record_size_lo;
		const records_area_size = header_records_area_size - 100;
		const details_area_size = file_size - header_records_area_size;

		return {
			file_size: file_size,
			header_size: 100,
			records_size: records_area_size,
			details_size: details_area_size,
			version: header.file_version
		};
	}

	public get_records_info(buffer: Buffer): RecordStats {
		const file_parsing_service = this.service_man.get_service(
			"file_parsing"
		) as FileParsingService;

		return file_parsing_service.parse_records(buffer).stats;
	}

	public get_file_info(buffer: Buffer): FileInfo {
		const file_parsing_service = this.service_man.get_service(
			"file_parsing"
		) as FileParsingService;
		const header_info = this.get_header_info(buffer);
		const record_stats = file_parsing_service.parse_records(buffer, header_info)
			.stats;
		return { header_info, records_info: record_stats };
	}

	public get_details(buffer: Buffer): any {
		const header_info = this.get_header_info(buffer);
		const details_start = header_info.header_size + header_info.records_size;
		const details_buf = buffer.slice(details_start);
		const parser_service = this.service_man.get_service(
			"parsers"
		) as BinaryParserService;
		const details_parser = parser_service.get_parser(ParserTypes.Details);
		const details = details_parser.parse(details_buf);
		details.timestamp = bignum_convert_buffer(details.timestamp);
		return details;
	}
}
