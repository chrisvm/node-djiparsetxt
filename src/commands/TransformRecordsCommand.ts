import { ServiceManager, ServiceTypes } from "../common/ServiceManager";
import { CacheTransformService } from "../services/CacheTransformService";
import { FileParsingService } from "../services/FileParsingService";
import { FilesService } from "../services/FilesService";
import { ICommand } from "./ICommand";

export class TransformRecordsCommand implements ICommand {
	public exec(serviceMan: ServiceManager): void {
		const filesService = serviceMan.get_service<FilesService>(ServiceTypes.Files);
		const fileParsingService = serviceMan.get_service<FileParsingService>(
			ServiceTypes.FileParsing,
		);

		const cacheTransService = serviceMan.get_service<CacheTransformService>(
			ServiceTypes.CacheTransform,
		);

		for (const file of filesService.files) {
			const recordsCache = fileParsingService.parse_records(file.buffer);
			const outputBuf = cacheTransService.transform(recordsCache);

			let output: string;
			if (serviceMan.argv.pretty_print) {
				output = JSON.stringify(outputBuf, null, 2);
			} else {
				output = JSON.stringify(outputBuf);
			}

			if (serviceMan.argv.output) {
				// todo: work with the --output option
			} else {
				console.log(output);
			}
		}
	}
}
