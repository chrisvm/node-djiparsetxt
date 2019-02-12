import {CliArguments} from './CliArguments';
import {ServiceManager} from './ServiceManager';
import {CommandManager} from './CommandManager';

// main function
(function main () {
  const argv = new CliArguments();

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
    return;
  }
})();