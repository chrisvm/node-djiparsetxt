import {ServiceManager} from "../common/ServiceManager";

export abstract class Command<ParamsType = void, ReturnType = void> {
	constructor(protected serviceMan: ServiceManager) {}
	abstract exec(params?: ParamsType): ReturnType;
}
