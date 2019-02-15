import {CliArguments} from './CliArguments';
import {ServiceManager} from './ServiceManager';
import {CommandManager} from './CommandManager';

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
    command_man.run("print_info");
    return;
  }

  if (argv.unscramble) {
    command_man.run('unscramble');
    return;
  }
}