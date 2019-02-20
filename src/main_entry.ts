import {CliArguments} from './common/CliArguments';
import {ServiceManager} from './common/ServiceManager';
import {CommandManager, CommandTypes} from './common/CommandManager';

export function main_entry(args: string[])
{
  const argv = new CliArguments(args);

	// assert cli args
	if (argv.assert_args()) {
		return;
	}

	// create managers
	const service_man = new ServiceManager(argv);
	const command_man = new CommandManager(service_man);

	if (argv.print_header || argv.print_records || argv.details) {
		command_man.run(CommandTypes.PrintInfo);
		return;
	}

	if (argv.unscramble) {
		command_man.run(CommandTypes.Unscramble);
		return;
	}
	
	if (argv.show_record != null) {
		command_man.run(CommandTypes.ShowType);
		return;
	}

	command_man.run(CommandTypes.TransformRecords);
}