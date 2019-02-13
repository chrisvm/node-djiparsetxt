import { ICommand } from "./ICommand";
import { ServiceManager } from "../ServiceManager";

export class PrintRecordsCommand implements ICommand {
	public exec(service_man: ServiceManager): void {}
}
