import BaseService from './BaseService';
import {
	BinaryParserService,
	ParserTypes
} from "./BinaryParserService";

interface FileInfo
{
  file_size: number;
  records_size: number;
  details_size: number;
  version: number;
}

export class FileInfoService extends BaseService {
  public name: string = 'file_info';
  
  get_info(buffer: Buffer): FileInfo
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
    const records_area_size =
      header.header_record_size_lo +
      (header.header_record_size_hi << 32) -
      100;
    const details_area_size = file_size - records_area_size + 100;
    
    return {
      file_size: file_size,
      records_size: records_area_size,
      details_size: details_area_size,
      version: header.file_version
    };

    // // get records buffer
    // const record_parser = parser_service.get_parser(
    //   ParserTypes.BaseRecord
    // );
    // const records_buff = buffer.slice(100, records_area_size);
    // console.log(record_parser.parse(records_buff));
  }
}