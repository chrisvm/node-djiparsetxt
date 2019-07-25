import { ICommand } from "../commands/ICommand";
import { PrintInfoCommand } from "../commands/PrintInfoCommand";
import { ShowTypeCommand } from "../commands/ShowTypeCommand";
import { TransformRecordsCommand } from "../commands/TransformRecordsCommand";
import { UnscrambleCommand } from "../commands/UnscrambleCommand";
import { ILazyLoadingEntry } from "./lazy_loading";
import { ServiceManager } from "./ServiceManager";

enum CommandTypes {
	PrintInfo = "print_info",
	Unscramble = "unscramble",
	ShowType = "show_type",
	TransformRecords = "transform_records",
}

class CommandManager {

	private commands: { [name: string]: ILazyLoadingEntry<ICommand> };
	private serviceMan: ServiceManager;

	constructor(serviceMan: ServiceManager) {
		this.serviceMan = serviceMan;
		this.commands = {
			print_info: {
				instance: null,
				factory: () => new PrintInfoCommand(),
			},
			unscramble: {
				instance: null,
				factory: () => new UnscrambleCommand(),
			},
			show_type: {
				instance: null,
				factory: () => new ShowTypeCommand(),
			},
			transform_records: {
				instance: null,
				factory: () => new TransformRecordsCommand(),
			},
		};
	}

	public run(type: CommandTypes): void {
		const command = this.commands[type];

		if (command.instance == null) {
			command.instance = command.factory();
		}

		command.instance.exec(this.serviceMan);
	}
}

export { CommandManager, CommandTypes };
