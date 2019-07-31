import {ServiceManager} from "../common/ServiceManager";

export abstract class Command<ParamsType = void, ReturnType = void> {
	private _logs: string[] = [];

	constructor(protected serviceMan: ServiceManager) {}
	public abstract exec(params: ParamsType): ReturnType;

	protected log(...args: any[]) {
		const printed = args.map((val) => val.toString());
		this._logs.push(printed.join(" "));
	}

	protected getLog(): string {
		return this._logs.join("\n");
	}
}
