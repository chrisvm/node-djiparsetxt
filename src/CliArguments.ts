import * as minimist from 'minimist';


export class CliArguments {
  
  private argv: minimist.ParsedArgs;

  constructor(args: string[])
  {
    this.argv = minimist(args);
  }

  public assert_args(): boolean 
  {
    const argv = this.argv;

    // if argument list empty (no filenames given)
    if (argv._.length == 0) {
      CliArguments.print_usage();
      return true;
    }

    if (argv.help == true || argv.h == true) {
      CliArguments.print_help();
      return true;
    }
    return false;
  }

  public static print_usage(): void
  {
    console.log('Usage: node-djiparsetext FILE [FILE...] [OPTIONS]\n');
  }

  private static options_descriptions = [
    {
      short_name: 'h',
      long_name: 'header',
      description: 'Print header info to stdout, ignoring the rest of the file.'
    }
  ];

  public static print_help(): void
  {
    CliArguments.print_usage();
    console.log('Options:');
    for (const option of CliArguments.options_descriptions) {
      console.log(`    --${option.long_name}, -${option.short_name}: ${option.description}`);
    }
  }

  public get print_header(): boolean {
    return this.argv.header == true || this.argv.h == true;
  }

  public get print_records(): boolean {
    return this.argv.records == true || this.argv.r == true;
  }
  
  public get file_paths(): string[] {
    return this.argv._;
  }
}