import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { FileParsingService } from "../services/FileParsingService";
import { FilesService } from "../services/FilesService";
import { RecordTypes } from "../services/RecordTypes";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { ICommand } from "./ICommand";

export class ShowTypeCommand implements ICommand {

	public exec(serviceMan: ServiceManager): void {
		const filesService = serviceMan.get_service<FilesService>(ServiceTypes.Files);
		const fileParsingService = serviceMan.get_service<FileParsingService>(ServiceTypes.FileParsing);
		const scrambleTableService = serviceMan.get_service<ScrambleTableService>(ServiceTypes.ScrambleTable);

		for (const file of filesService.files) {
			const recordsCache = fileParsingService.parse_records(file.buffer);
			const recordType = serviceMan.argv.show_record as RecordTypes;
			const recordsOfType = fileParsingService.filter_records(recordsCache, recordType);

			const typeName = RecordTypes[recordType];

			if (typeName) {
				console.log(`file '${file.path}' and type = ${typeName}:`);

				recordsOfType.forEach((record) => {
					const unscrambledRec = scrambleTableService.unscramble_record(record);
					const subParsed = fileParsingService.parse_record_by_type(unscrambledRec, recordType);
					console.log(subParsed);
				});

				return;
			}

			throw new Error(`type '${recordType}' not recognized`);
		}
	}
}
