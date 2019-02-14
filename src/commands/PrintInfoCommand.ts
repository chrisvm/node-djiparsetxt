import { ICommand } from "./ICommand";
import { ServiceManager } from "../ServiceManager";
import { FilesService } from "../services/FilesService";
import { FileInfoService } from '../services/FileInfoService';

export class PrintInfoCommand implements ICommand {
	public exec(service_man: ServiceManager): void {
		const files_service = service_man.get_service('files') as FilesService;
		const file_info_service = service_man.get_service('file_info') as FileInfoService;

		if (files_service) {
			files_service.files(file => {
				// show header details
				console.log(`file "${file.path}"`);
				if (service_man.argv.print_header) {
					const header_info = file_info_service.get_header_info(file.buffer);
					console.log('Header Info:');
					console.log(`    file size = ${header_info.file_size} B`);
					console.log(`    records area size = ${header_info.records_size} B`);
					console.log(`    details area size = ${header_info.details_size} B`);
					console.log(`    version number string = '${header_info.version}'`);
				}

				if (service_man.argv.print_records) {
					console.log('Records Info:');
					const stats = file_info_service.get_records_info(file.buffer);
					console.log(`    records area size = ${stats.records_area_size} B`);
					console.log(`    record count = ${stats.record_count} Records`);
					console.log(`    invalid records = ${stats.invalid_records}`);
				}
			});
		}
	}
}
