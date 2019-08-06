export class Version {
	public static CreateEmpty(): Version {
		const buf = new Buffer([0, 0, 0, 0]);
		return new Version(buf);
	}

	constructor(private buf: Buffer) {}

	public toString(): string {
		const ver = this.buf;
		return `${ver[0]}.${ver[1]}.${ver[2]}.${ver[3]}`;
	}
}
