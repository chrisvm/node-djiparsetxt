import {ServiceManager} from '../ServiceManager';

export interface ICommand
{
  exec(service_man: ServiceManager): void;
}