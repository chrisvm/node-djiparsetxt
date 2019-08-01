import { expect } from "chai";
import fs from "fs";
import path from "path";
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

	it("should return an IFile obj when a file is found", () => {
		const testFile = path.join(__dirname, "../assets/flight_logs/mavic2/mavic2_0.txt");
		const filepaths: string[] = [ testFile ];
		const files = cmd.exec(filepaths);

		expect(files).to.have.lengthOf(1);
		expect(files[0].path).to.equal(testFile);
		expect(files[0].buffer).to.not.equal(null);

		const stats = fs.statSync(testFile);
		if (files[0].buffer !== null) {
			expect(files[0].buffer.length).to.equal(stats.size);
		}
	});
});
