import BaseService from './BaseService';
import {
	BinaryParserService,
	ParserTypes
} from "./BinaryParserService";

interface HeaderInfo
{
  file_size: number;
  header_size: number;
  records_size: number;
  details_size: number;
  version: number;
}

interface RecordsInfo
{
  records_size: number;
  version: number;
  record_count: number;
}

interface FileInfo
{
  header_info: HeaderInfo;
  records_info: RecordsInfo;
}

export class FileInfoService extends BaseService {
  public name: string = 'file_info';
  
  public get_header_info(buffer: Buffer): HeaderInfo
  {
    const parser_service = this.service_man.get_service(
      "parsers"
    ) as BinaryParserService;
    const header_parser = parser_service.get_parser(
      ParserTypes.Header
    );

    // get first 100 bytes and parse them.
    const header_buff = buffer.slice(0, 100);
    const header = header_parser.parse(header_buff);

    // calculate details
    const file_size = buffer.length;
    const header_records_area_size = header.header_record_size_lo |
      (header.header_record_size_hi << 32);
    const records_area_size = header_records_area_size - 100;
    const details_area_size = file_size - header_records_area_size;
    
    return {
      file_size: file_size,
      records_size: records_area_size,
      details_size: details_area_size,
      version: header.file_version
    };
  }

  public get_records_info(buffer: Buffer): RecordsInfo
  {
    return this._get_records_info(buffer);
  }

  public get_file_info(buffer: Buffer): FileInfo
  {
    const header_info = this.get_header_info(buffer);
    const records_info = this._get_records_info(buffer, header_info);
    return {header_info, records_info};
  }

  private _get_records_info(buffer: Buffer, header_info?: HeaderInfo): RecordsInfo
  {
    if (header_info == undefined) {
      header_info = this.get_header_info(buffer);
    }

    const records_buff = buffer.slice(100, header_info.records_size + 100);
    const records = this.parse_records(records_buff);

    return {
      version: header_info.version,
      records_size: header_info.records_size,
      record_count: records.length
    };
  }

  private parse_records(buffer: Buffer): any[]
  {
    const parser_service = this.service_man.get_service(
      "parsers"
    ) as BinaryParserService;

    const record_parser = parser_service.get_parser(
      ParserTypes.BaseRecord
    );

    const records = [];
    while (buffer.length > 0) {
      let record = record_parser.parse(buffer);
      console.log(record);
      records.push(record);
      if (record.length + 3 == buffer.length) break;
      buffer = buffer.slice(record.length + 3);
      console.log(buffer.length);
      console.log(buffer);
    }

    return records;
  }
}