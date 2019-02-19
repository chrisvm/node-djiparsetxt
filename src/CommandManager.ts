import { PrintInfoCommand } from "./commands/PrintInfoCommand";
import { UnscrambleCommand } from './commands/UnscrambleCommand';
import { ICommand } from "./commands/ICommand";
import { ServiceManager } from "./ServiceManager";

interface ILazyLoadingEntry<t>
{
	instance: t | null;
	factory: () => t;
}

class CommandManager {
	private commands: { [name: string]: ILazyLoadingEntry<ICommand> };
	private service_man: ServiceManager;

	constructor(service_man: ServiceManager) {
		this.service_man = service_man;
		this.commands = {
			print_info: {
				instance: null,
				factory: () => new PrintInfoCommand()
			},
			unscramble: {
				instance: null,
				factory: () => new UnscrambleCommand()
			}
		};
	}

	public run(name: string) {
		const command = this.commands[name];

		if (command == null || command == undefined) {
			throw new Error(`command '${name}' not found`);
		}

		if (command.instance == null) {
			command.instance = command.factory();
		}

		command.instance.exec(this.service_man);	
	}
}

export { CommandManager };
