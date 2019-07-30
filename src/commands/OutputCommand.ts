import fs from "fs";
import path from "path";
import { Command } from "./Command";
import { IFile } from "./ReadFileCommand";

export interface IOutputOptions {
	file: IFile;
	buffer: Buffer;
	output: string | null;
}

export class OutputCommand extends Command<IOutputOptions, void> {
	public exec(options: IOutputOptions): void {
		const file = options.file;
		const buffer = options.buffer;

		let outFile = file.path + ".unscrambled";

		if (options.output != null) {
			// check if output opt is dir or path to file
			const basename = path.basename(outFile);
			outFile = path.join(options.output, basename);
		}

		fs.writeFileSync(outFile, buffer);
	}
}
