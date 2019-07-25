import { ServiceManager } from "../common/ServiceManager";

export default abstract class BaseService {
	protected serviceMan: ServiceManager;

	constructor(serviceMan: ServiceManager) {
		this.serviceMan = serviceMan;
	}
}
