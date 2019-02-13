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

  // print header
  if (argv.print_header) {
    // print header
    command_man.run("print_header");
  }

  if (argv.print_records) {
    command_man.run('print_records');
  }

  if (argv.print_header || argv.print_records) {
    return;
  }
}