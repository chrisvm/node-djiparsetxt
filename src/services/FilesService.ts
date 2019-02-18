import BaseService from "./BaseService";
import * as fs from "fs";

export interface IFile {
	path: string;
	buffer: Buffer;
}

export class FilesService extends BaseService {
	private files_m: IFile[] = [];
	private initFiles: boolean = true;

	public static type_name: string = "files";
	public name: string = FilesService.type_name;
	
	public files(cb: (file: IFile) => void) {
		if (this.initFiles) {
			const argv = this.service_man.argv;
			argv.file_paths.forEach(file_path => {
				const file_buffer = fs.readFileSync(file_path);
				this.files_m.push({ path: file_path, buffer: file_buffer });
			});
			this.initFiles = false;
		}

		this.files_m.forEach(file => cb(file));
	}
}
