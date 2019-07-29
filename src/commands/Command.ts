import {ServiceManager} from "../common/ServiceManager";

export abstract class Command {
	abstract exec(serviceMan: ServiceManager): void;
}
