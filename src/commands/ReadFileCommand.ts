import { Command } from "./Command";
import fs from "fs";

export interface IFile {
	path: string;
	buffer: Buffer;
}

export class ReadFileCommand extends Command<string[], IFile[]>
{
	public exec(file_paths: string[]): IFile[] {
		let files: IFile[] = [];

		for (const path of file_paths) {
			const buffer = fs.readFileSync(path);
			files.push({ path, buffer });
		}

		return files;
	}
}