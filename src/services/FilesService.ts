import * as fs from "fs";
import BaseService from "./BaseService";

export interface IFile {
	path: string;
	buffer: Buffer;
}

export class FilesService extends BaseService {

	public static typeName: string = "files";
	public name: string = FilesService.typeName;
	private filesM: IFile[] = [];
	private initFiles: boolean = true;

	public files(cb: (file: IFile) => void) {
		if (this.initFiles) {
			const argv = this.serviceMan.argv;
			argv.file_paths.forEach((filePath) => {
				const fileBuffer = fs.readFileSync(filePath);
				this.filesM.push({ path: filePath, buffer: fileBuffer });
			});
			this.initFiles = false;
		}

		this.filesM.forEach((file) => cb(file));
	}

	public write_file(path: string, buf: Buffer) {
		fs.writeFileSync(path, buf);
	}
}
