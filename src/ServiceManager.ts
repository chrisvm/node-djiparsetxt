import { CliArguments } from "./CliArguments";
import BaseService from "./services/BaseService";
import { FilesService } from "./services/FilesService";
import { BinaryParserService } from "./services/BinaryParserService";
import { FileInfoService } from "./services/FileInfoService";
import { ScrambleTableService } from "./services/ScrambleTableService";
import { FileParsingService } from "./services/FileParsingService";

// entry into the lazy loading table
interface IServiceLLEntry
{
  instance: BaseService | null, 
  factory: () => BaseService
}

export class ServiceManager {

  private argv_m: CliArguments;
  private services: {[name: string]: IServiceLLEntry};

  constructor(argv: CliArguments) 
  {
    this.argv_m = argv;
    this.services = {
      'files': {
        instance: null,
        factory: () => new FilesService(this)
      },
      'parsers': {
        instance: null,
        factory: () => new BinaryParserService(this)
      },
      'file_info': {
        instance: null,
        factory: () => new FileInfoService(this)
      },
      'scramble_table': {
        instance: null,
        factory: () => new ScrambleTableService(this)
			},
			'file_parsing': {
				instance: null,
				factory: () => new FileParsingService(this)
			}
    };
  }
  
  public get_service(name: string): BaseService | null
  {
    const service = this.services[name];
    
    if (service == null) {
      throw new Error(`service ${name} not found`);
    }

    if (service.instance == null) {
      service.instance = service.factory();
    }

    return service.instance;
  }

	public get argv() {
		return this.argv_m;
	}
}
