import {ICommand} from './ICommand';
import { ServiceManager } from '../ServiceManager';

export class UnscrambleCommand implements ICommand {
  public name: string = 'unscramble';

  public exec(service_man: ServiceManager): void
  {
    
  }
}