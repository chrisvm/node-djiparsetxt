import { expect } from "chai";
import { ReadFileCommand } from "../src/commands";
import { ServiceManagerMock } from "./ServiceManager.mock";

describe("ReadFileCommand", () => {
	const serviceMan = new ServiceManagerMock();
	const cmd = new ReadFileCommand(serviceMan);

	it("should return empty array given an empty array of filepaths", () => {
		const filepaths: string[] = [];
		const files = cmd.exec(filepaths);

		expect(files).to.have.lengthOf(0);
	});

	it("should have file.buffer set as null when file not found", () => {
		const filepaths: string[] = ["asdasdasda"];
		const files = cmd.exec(filepaths);

		expect(files).to.have.lengthOf(1);
		expect(files[0].buffer).to.equal(null);
	});
});
