import * as fs from "fs";
import BaseService from "./BaseService";

export interface IFile {
	path: string;
	buffer: Buffer;
}

export class FilesService extends BaseService {
	public static typeName: string = "files";
	public name: string = FilesService.typeName;
	private _files: IFile[] = [];
	private initFiles: boolean = true;

	public get files(): IFile[] {
		// check if we have read the files from disk
		if (this.initFiles) {
			const argv = this.serviceMan.argv;

			for (const filePath of argv.file_paths) {
				const fileBuffer = fs.readFileSync(filePath);
				this._files.push({ path: filePath, buffer: fileBuffer });
			}

			this.initFiles = false;
		}

		return this._files;
	}

	public writeFile(path: string, buf: Buffer) {
		fs.writeFileSync(path, buf);
	}
}
