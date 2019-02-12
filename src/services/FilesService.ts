import {BaseService} from './IService';
import * as fs from 'fs';

export class FilesService extends BaseService {
  private files_m: any[] = null;
  public name: string = 'files';

  public files(cb: (file: any) => void)
  {
    if (this.files_m === null) {
      
    }
  }
}