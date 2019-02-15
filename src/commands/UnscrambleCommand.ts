import {ICommand} from './ICommand';
import { ServiceManager } from '../ServiceManager';
import { FileInfoService } from '../services/FileInfoService';
import { FilesService } from '../services/FilesService';
import { FileParsingService } from '../services/FileParsingService';
import { ScrambleTableService } from '../services/ScrambleTableService';

export class UnscrambleCommand implements ICommand {
  public name: string = 'unscramble';

  public exec(service_man: ServiceManager): void
  {
    const files_service = service_man.get_service('files') as FilesService;
    const file_parsing_service = service_man.get_service(
      'file_parsing'
    ) as FileParsingService;

    const scramble_table_service = service_man.get_service(
      'scramble_table'
    ) as ScrambleTableService;

    files_service.files(file => {
      const records_cache = file_parsing_service.parse_records(file.buffer);
      records_cache.records = records_cache.records.map((val) => {
        return scramble_table_service.unscramble_record(val);
      });

      console.log(`File '${file.path}'`);
      console.log(records_cache);
    });
  }
}