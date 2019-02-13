import {CliArguments} from './CliArguments';
import BaseService from './services/BaseService';
import {FilesService} from './services/FilesService';
import {BinaryParserService} from './services/BinaryParserService';
import {FileInfoService} from './services/FileInfoService';

export class ServiceManager {
  private argv_m: CliArguments;
  private services_m: {[name: string]: BaseService};

  constructor(argv: CliArguments) 
  {
    this.argv_m = argv;
    this.services_m = {};
    // todo: add lazy loading to services
    [
      new FilesService(this),
      new BinaryParserService(this),
      new FileInfoService(this)
    ].forEach((val: BaseService) => this.services_m[val.name] = val);
  }
  
  public get_service(name: string): BaseService | null
  {
    const service = this.services_m[name];
    if (service) {
      return service;
    }
    return null;
  }

  public get argv() { return this.argv_m; }
}