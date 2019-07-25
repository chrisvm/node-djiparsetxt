import {ServiceManager} from "../common/ServiceManager";

export interface ICommand {
  exec(service_man: ServiceManager): void;
}
