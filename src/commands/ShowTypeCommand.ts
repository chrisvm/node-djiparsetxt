import { ICommand } from "./ICommand";
import { ServiceManager } from "../common/ServiceManager";
import { FilesService } from '../services/FilesService';
import { FileParsingService } from '../services/FileParsingService';
import { ScrambleTableService } from '../services/ScrambleTableService';
import { RecordTypes } from "../services/RecordTypes";

export class ShowTypeCommand implements ICommand {
	
	exec (service_man: ServiceManager): void {
		const files_service = service_man.get_service('files') as FilesService;
    const file_parsing_service = service_man.get_service(
      'file_parsing'
		) as FileParsingService;
		
		const scramble_table_service = service_man.get_service(
      'scramble_table'
		) as ScrambleTableService;
		
		files_service.files(file => {
			const records_cache = file_parsing_service.parse_records(file.buffer);
			const record_type = service_man.argv.show_record as RecordTypes;
			const records_of_type = file_parsing_service.filter_records(records_cache, record_type);

			console.log(`file '${file.path}' and type = ${record_type}:`);

			records_of_type.forEach((record) => {
				const unscrambled_rec = scramble_table_service.unscramble_record(record);
				const sub_parsed = file_parsing_service.parse_record_by_type(unscrambled_rec, record_type);
				console.log(sub_parsed);
			});
		});
	}
}