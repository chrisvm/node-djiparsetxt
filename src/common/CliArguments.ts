import minimist from "minimist";

interface IOptionDescription {
	short_name: string;
	long_name: string;
	description: string;
	param_name?: string;
}

export class CliArguments {

	public get isEmpty(): boolean {
		return this.isEmpty;
	}

	public get print_header(): boolean {
		return this.argv.header || this.argv.h;
	}

	public get print_records(): boolean {
		return this.argv.records || this.argv.r;
	}

	public get file_paths(): string[] {
		return this.argv._;
	}

	public get details(): boolean {
		return this.argv.details || this.argv.d;
	}

	public get output(): string | null {
		if (this.argv.output) { return this.argv.output; }
		return this.argv.o;
	}

	public get unscramble(): boolean {
		return this.argv.unscramble || this.argv.u;
	}

	public get show_record(): number | null {
		return this.argv.show_type || this.argv.s;
	}

	public get pretty_print(): boolean {
		return this.argv.pretty || this.argv.p;
	}

	public get distrib(): boolean {
		return this.argv.distribution || this.argv.d;
	}

	public static CreateEmpty(): CliArguments {
		return new CliArguments([]);
	}

	public static print_usage(): void {
		console.log("Usage: node-djiparsetext FILE [FILE...] [OPTIONS]\n");
	}

	public static print_help(): void {
		CliArguments.print_usage();

		console.log("Options:");

		for (const option of CliArguments.optionsDescriptions) {
			if (option.param_name) {
				console.log(`    --${option.long_name} ${option.param_name},` +
					` -${option.short_name} ${option.param_name}: ${option.description}`);
				continue;
			}
			console.log(`    --${option.long_name}, -${option.short_name}:` +
				` ${option.description}`);
		}
	}

	private static optionsDescriptions: IOptionDescription[] = [
		{
			short_name: "u",
			long_name: "unscramble",
			description: "Create a copy of the file with the records unscrambled.",
		},
		{
			short_name: "h",
			long_name: "header",
			description: "Print header info to stdout.",
		},
		{
			short_name: "r",
			long_name: "records",
			description: "Print records info to stdout.",
		},
		{
			short_name: "d",
			long_name: "details",
			description: "Print the details section to stdout.",
		},
		{
			short_name: "o",
			long_name: "output",
			description: "Path to use for output files.",
		},
		{
			short_name: "s",
			long_name: "show-type",
			description: "Show the records of the given type.",
			param_name: "type",
		},
		{
			short_name: "d",
			long_name: "distribution",
			description: "Print the record types as they appear in the file.",
		},
		{
			short_name: "p",
			long_name: "--pretty",
			description: "Pretty print the json output.",
		},
	];

	private argv: minimist.ParsedArgs;
	private _isEmpty: boolean;

	constructor(args: string[]) {
		this._isEmpty = false;
		if (args.length === 0) {
			this._isEmpty = true;
		}

		this.argv = minimist(args);
	}

	public assert_args(): boolean {
		const argv = this.argv;

		if (argv.help === true || argv.h === true) {
			CliArguments.print_help();
			return true;
		}

		// if argument list empty (no filenames given)
		if (argv._.length === 0) {
			console.log(`node-djiparsetxt: No files given`);
			CliArguments.print_usage();
			return true;
		}

		return false;
	}
}
