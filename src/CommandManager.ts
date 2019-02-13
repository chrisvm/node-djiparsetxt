import { PrintHeaderCommand } from "./commands/PrintHeaderCommand";
import { PrintRecordsCommand } from "./commands/PrintRecordsCommand";
import { ICommand } from "./commands/ICommand";
import { ServiceManager } from "./ServiceManager";

class CommandManager {
	private commands: { [name: string]: ICommand };
	private service_man: ServiceManager;

	constructor(service_man: ServiceManager) {
		this.service_man = service_man;
		this.commands = {
			print_header: new PrintHeaderCommand(),
			print_records: new PrintRecordsCommand()
		};
	}

	public run(name: string) {
		const command = this.commands[name];
		if (command !== null) {
			command.exec(this.service_man);
		}
	}
}

export { CommandManager };
