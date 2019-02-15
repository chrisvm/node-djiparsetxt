import { PrintInfoCommand } from "./commands/PrintInfoCommand";
import { UnscrambleCommand } from './commands/UnscrambleCommand';
import { ICommand } from "./commands/ICommand";
import { ServiceManager } from "./ServiceManager";

class CommandManager {
	private commands: { [name: string]: ICommand };
	private service_man: ServiceManager;

	constructor(service_man: ServiceManager) {
		this.service_man = service_man;
		this.commands = {};
		// todo: add lazy loading to 
		[
			new PrintInfoCommand(),
			new UnscrambleCommand()
		].forEach((val: ICommand) => this.commands[val.name] = val);
	}

	public run(name: string) {
		const command = this.commands[name];
		if (command !== null) {
			command.exec(this.service_man);
		}
	}
}

export { CommandManager };
