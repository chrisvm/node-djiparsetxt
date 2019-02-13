import { ICommand } from "./ICommand";
import { ServiceManager } from "../ServiceManager";
import { FilesService } from "../services/FilesService";
import { FileInfoService } from '../services/FileInfoService';

export class PrintHeaderCommand implements ICommand {
	public exec(service_man: ServiceManager): void {
		const files_service = service_man.get_service('files') as FilesService;
		const file_info_service = service_man.get_service('file_info') as FileInfoService;

		if (files_service) {
			files_service.files(file => {
				const file_info = file_info_service.get_info(file.buffer);

				// show details
				console.log(`file "${file.path}"`);
				console.log(`    file size = ${file_info.file_size} B`);
				console.log(`    records area size = ${file_info.records_size} B`);
				console.log(`    details area size = ${file_info.details_size} B`);
				console.log(`    version number string = '${file_info.version}'`);
			});
		}
	}
}
