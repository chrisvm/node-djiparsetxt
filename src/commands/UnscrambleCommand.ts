import {ICommand} from './ICommand';
import { ServiceManager } from '../ServiceManager';
import { FilesService } from '../services/FilesService';
import { FileParsingService } from '../services/FileParsingService';
import { ScrambleTableService } from '../services/ScrambleTableService';
import { FileInfoService } from '../services/FileInfoService';
import { RecordTypes } from '../services/RecordTypes';

export class UnscrambleCommand implements ICommand {

  public exec(service_man: ServiceManager): void
  {
		const files_service = service_man.get_service('files') as FilesService;
		const file_info_service = service_man.get_service('file_info') as FileInfoService;
    const file_parsing_service = service_man.get_service(
      'file_parsing'
    ) as FileParsingService;

    const scramble_table_service = service_man.get_service(
      'scramble_table'
    ) as ScrambleTableService;

    files_service.files(file => {
			const record_header = file_info_service.get_header_info(file.buffer);
      const records_cache = file_parsing_service.parse_records(file.buffer);
			
			records_cache.records = records_cache.records.map((val) => {
				if (val.type == RecordTypes.JPEG) return val;
        return scramble_table_service.unscramble_record(val);
      });

			const unscrambled_buf = new Buffer(file.buffer.length);
			file.buffer.copy(unscrambled_buf, 0, 0, 100);
			
			let offset = 100;
			let record_index = 0;
			const records_header_size = record_header.records_size + 
				record_header.header_size;
			while (offset < records_header_size) {
				const record = records_cache.records[record_index++];
				unscrambled_buf.writeUInt8(record.type, offset++);
				unscrambled_buf.writeUInt8(record.length, offset++);

				// jpeg records dont have scrambling, treat accordingly
				if (record.type != RecordTypes.JPEG) {
					record.data.copy(unscrambled_buf, offset);
					offset += record.length;
					unscrambled_buf.writeUInt8(0xFF, offset++);
				} else {
					unscrambled_buf.writeUInt8(0, offset++);
					unscrambled_buf.writeUInt8(0, offset++);
					// todo: deal with jpeg images
				}
			}

			file.buffer.copy(unscrambled_buf, offset, offset);

			let out_file = file.path + '.unscrambled';
			
			if (service_man.argv.output != null) {
				out_file = service_man.argv.output;
			}

			files_service.write_file(out_file, unscrambled_buf);
    });
  }
}