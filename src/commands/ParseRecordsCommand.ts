import { ServiceTypes } from "../common/ServiceManager";
import { FileParsingService } from "../services/FileParsingService";
import { Command } from "./Command";
import { IFile, IRecordCache } from "../shared/interfaces";

export interface IParseRecordsOptions {
	file: IFile;
}

export class ParseRecordsCommand extends Command<IParseRecordsOptions, IRecordCache> {
	public exec(options: IParseRecordsOptions): IRecordCache {
		const serviceMan = this.serviceMan;
		const fileParsingService = serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const file = options.file;

		if (file.buffer === null) {
			return fileParsingService.createEmptyCache();
		}

		const recordsCache = fileParsingService.parse_records(file.buffer);
		return recordsCache;
	}
}
