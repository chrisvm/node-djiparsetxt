export class Version {
	public static CreateEmpty(): Version {
		const ver = 0x00000000;
		return new Version(ver);
	}

	public ver: number[];

	constructor(ver: number) {
		this.ver = [
			ver & 0x000000FF,
			ver & 0x0000FF00,
			ver & 0x00FF0000,
			ver & 0xFF000000,
		];
	}

	public toString(): string {
		const ver = this.ver;
		return `${ver[0]}.${ver[1]}.${ver[2]}.${ver[3]}`;
	}
}
