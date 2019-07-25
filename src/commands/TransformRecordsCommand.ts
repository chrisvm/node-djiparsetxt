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

		const output: {files: {[path: string]: any[][]}} = {
			files: {},
		};

		filesService.files((file) => {
			const recordsCache = fileParsingService.parse_records(file.buffer);
			const outputBuf = cacheTransService.transform(recordsCache);
			output.files[file.path] = outputBuf;
		});

		console.log(JSON.stringify(output));
	}
}
