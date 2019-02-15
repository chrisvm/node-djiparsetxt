import {ServiceManager} from '../ServiceManager';

export interface ICommand
{
  name: string;
  exec(service_man: ServiceManager): void;
}