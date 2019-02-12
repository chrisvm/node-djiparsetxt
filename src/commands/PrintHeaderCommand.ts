import { ICommand } from "./ICommand";
import { ServiceManager } from "../ServiceManager";
import { FilesService, IFile } from "../services/FilesService";
import { Parser } from 'binary-parser';

export class PrintHeaderCommand implements ICommand {
	private header_parser: any;

	constructor() 
	{
		this.header_parser = new Parser()
			.uint32le('header_record_size_lo')
			.uint32le('header_record_size_hi')
			.uint32le('file_version')
			.array('unused', {
				type: 'uint8',
				length: 88
			});
	}

	public exec(service_man: ServiceManager): void {
		
		const files_service = service_man.get_service("files") as FilesService;
		
		if (files_service) {
			files_service.files((file) => {
				// get first 100 bytes and parse them.
				const header_buff = file.buffer.slice(0, 100);
				const header = this.header_parser.parse(header_buff);
				
				// calculate details
				const file_size = file.buffer.length;
				const records_area_size = header.header_record_size_lo + 		
					(header.header_record_size_hi << 32) - 100;
				const details_area_size = file_size - records_area_size + 100;

				// show details 
				console.log(`file "${file.path}"`);
				console.log(`    file size = ${file_size} B`);
				console.log(`    records area size = ${records_area_size} B`);
				console.log(`    details area size = ${details_area_size} B`);
			});
		}
	}
}
