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

		filesService.forEachFile((file) => {
			const recordsCache = fileParsingService.parse_records(file.buffer);
			const outputBuf = cacheTransService.transform(recordsCache);

			if (serviceMan.argv.pretty_print) {
				console.log(JSON.stringify(outputBuf, null, 2));
			} else {
				console.log(JSON.stringify(outputBuf));
			}
		});
	}
}
