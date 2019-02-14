import BaseService from './BaseService';
import {RecordTypes} from './RecordTypes';
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

interface FileInfo
{
  header_info: HeaderInfo;
  records_info: RecordStats;
}

interface RecordStats
{
  records_area_size: number;
  version: number;
  record_count: number;
  type_count: {[type: number]: number};
  invalid_records: number;
}

interface RecordCache
{
  records: any[];
  stats: RecordStats;
}

function is_jpeg_soi (buffer: Buffer, offset: number): boolean
{
  return buffer.readUInt8(offset) == 0xFF && buffer.readUInt8(offset + 1) == 0xD8;
}

function is_jpeg_eoi (buffer: Buffer, offset: number): boolean
{
  return buffer.readUInt8(offset) == 0xFF && buffer.readUInt8(offset + 1) == 0xD9;
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

  public get_records_info(buffer: Buffer): RecordStats
  {
    return this.parse_records(buffer).stats;
  }

  public get_file_info(buffer: Buffer): FileInfo
  {
    const header_info = this.get_header_info(buffer);
    const record_stats = this.parse_records(buffer, header_info).stats;
    return {header_info, records_info: record_stats};
  }

  /**
   * Parses the 
   * @param buffer File buffer to parse.
   * @param header_info The parsed values from the header part of the file.
   */
  private parse_records(buffer: Buffer, header_info?: HeaderInfo): RecordCache
  {
    if (header_info == undefined) {
      header_info = this.get_header_info(buffer);
    }

    const records_buff = buffer.slice(100);
    let limit = header_info.records_size;
    const records = this.get_record_cache(records_buff, limit);
    records.stats.version = header_info.version;
    return records;
  }

  private get_record_cache(buffer: Buffer, limit: number): RecordCache
  {
    const parser_service = this.service_man.get_service(
      "parsers"
    ) as BinaryParserService;

    const record_parser = parser_service.get_parser(
      ParserTypes.BaseRecord
    );
    const record_start_parser = parser_service.get_parser(
      ParserTypes.StartRecord
    );

    const stats: RecordCache = {
      records: [],
      stats: {
        records_area_size: buffer.length,
        version: 0,
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
          throw Error('No zero watermark while parsing jpeg record');
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
      this.calc_stats(stats, record);
    }

    return stats;
  }

  private calc_stats(cache: RecordCache, record: any)
  {
    cache.records.push(record);
    cache.stats.record_count += 1;
    
    if (record.type != RecordTypes.JPEG && record.marker != 0xFF) {
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