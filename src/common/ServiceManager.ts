import BaseService from "../services/BaseService";
import { BinaryParserService } from "../services/BinaryParserService";
import { CacheTransformService } from "../services/CacheTransformService";
import { FileInfoService } from "../services/FileInfoService";
import { FileParsingService } from "../services/FileParsingService";
import { ScrambleTableService } from "../services/ScrambleTableService";
import { ILazyLoadingEntry } from "./lazy_loading";

export enum ServiceTypes {
	Parsers = "parsers",
	FileInfo = "file_info",
	ScrambleTable = "scramble_table",
	FileParsing = "file_parsing",
	CacheTransform = "cache_transform",
}

export class ServiceManager {

	protected services: {[name: string]: ILazyLoadingEntry<BaseService>};

	constructor() {
		this.services = {
			parsers: {
				instance: null,
				factory: () => new BinaryParserService(this),
			},
			file_info: {
				instance: null,
				factory: () => new FileInfoService(this),
			},
			scramble_table: {
				instance: null,
				factory: () => new ScrambleTableService(this),
			},
			file_parsing: {
				instance: null,
				factory: () => new FileParsingService(this),
			},
			cache_transform: {
				instance: null,
				factory: () => new CacheTransformService(this),
			},
		};
	}

	public get_service<T extends BaseService>(type: ServiceTypes): T {
		const service = this.services[type];

		if (service == null) {
			throw new Error(`service ${type} not found`);
		}

		if (service.instance == null) {
			service.instance = service.factory();
		}

		return service.instance as T;
	}
}
