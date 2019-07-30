import {ServiceManager} from "../common/ServiceManager";

export abstract class Command<T = void> {
	abstract exec(serviceMan: ServiceManager): T;
}
