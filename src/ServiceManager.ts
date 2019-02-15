import {CliArguments} from './CliArguments';
import BaseService from './services/BaseService';
import {FilesService} from './services/FilesService';
import {BinaryParserService} from './services/BinaryParserService';
import {FileInfoService} from './services/FileInfoService';
import {ScrambleTableService} from './services/ScrambleTableService';

export class ServiceManager {
  private argv_m: CliArguments;
  private services: {[name: string]: BaseService};

  constructor(argv: CliArguments) 
  {
    this.argv_m = argv;
    this.services = {};
    // todo: add lazy loading to services
    [
      new FilesService(this),
      new BinaryParserService(this),
      new FileInfoService(this),
      new ScrambleTableService(this)
    ].forEach((val: BaseService) => this.services[val.name] = val);
  }
  
  public get_service(name: string): BaseService | null
  {
    const service = this.services[name];
    if (service) {
      return service;
    }
    return null;
  }

  public get argv() { return this.argv_m; }
}