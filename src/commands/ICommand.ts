import {ServiceManager} from "../common/ServiceManager";

export interface ICommand {
	exec(serviceMan: ServiceManager): void;
}
