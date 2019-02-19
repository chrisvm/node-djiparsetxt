import { PrintInfoCommand } from "../commands/PrintInfoCommand";
import { UnscrambleCommand } from '../commands/UnscrambleCommand';
import { ShowTypeCommand } from '../commands/ShowTypeCommand';
import { ICommand } from "../commands/ICommand";
import { ServiceManager } from "./ServiceManager";
import { ILazyLoadingEntry } from './lazy_loading';

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
			},
			show_type: {
				instance: null,
				factory: () => new ShowTypeCommand()
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
