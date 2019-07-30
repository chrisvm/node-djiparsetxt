import { ServiceTypes } from "../common/ServiceManager";
import { FileParsingService, IRecordCache } from "../services/FileParsingService";
import { RecordTypes } from "../services/RecordTypes";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { Command } from "./Command";
import { IFile } from "./ReadFileCommand";

export interface IShowTypeOptions {
	records: IRecordCache;
	output: string | null;
	type: RecordTypes;
	file: IFile;
}

export class ShowTypeCommand extends Command<IShowTypeOptions, void> {

	public exec(options: IShowTypeOptions): void {
		const serviceMan = this.serviceMan;
		const fileParsingService = serviceMan.get_service<FileParsingService>(ServiceTypes.FileParsing);
		const scrambleTableService = serviceMan.get_service<ScrambleTableService>(ServiceTypes.ScrambleTable);

		const records = options.records;
		const type = options.type;
		const recordsOfType = fileParsingService.filter_records(records, type);
		const file = options.file;

		const typeName = RecordTypes[type];

		if (typeName) {
			console.log(`file '${file.path}' and type = ${typeName}:`);

			recordsOfType.forEach((record) => {
				const unscrambledRec = scrambleTableService.unscramble_record(record);
				const subParsed = fileParsingService.parse_record_by_type(unscrambledRec, type);
				console.log(subParsed);
			});

			return;
		}

		throw new Error(`type '${type}' not recognized`);
	}
}
