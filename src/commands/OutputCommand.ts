import fs from "fs";
import path from "path";
import { Command } from "./Command";

export interface IOutputOptions {
	file: string;
	buffer: Buffer | string;
	output: string | null;
}

export class OutputCommand extends Command<IOutputOptions, void> {
	public exec(options: IOutputOptions): void {
		let file = options.file;
		const buffer = options.buffer;

		// use -o option to output to file or dir
		if (options.output !== null && options.output !== undefined) {
			// check if output opt is dir or path to file
			const basename = path.basename(file);
			file = path.join(options.output, basename);
			fs.writeFileSync(file, buffer);
			return;
		}

		console.log(buffer.toString());
	}
}
