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

		expect(files.length).toEqual(0);
	});

	it("should have file.buffer set as null when file not found", () => {
		const filepaths: string[] = ["asdasdasda"];
		const files = cmd.exec(filepaths);

		expect(files.length).toEqual(1);
		expect(files[0].buffer).toBeNull();
	});

	it("should return an IFile obj when a file is found", () => {
		const testFile = path.join(__dirname, "../assets/flight_logs/mavic2/mavic2_0.txt");
		const filepaths: string[] = [ testFile ];
		const files = cmd.exec(filepaths);

		expect(files.length).toEqual(1);
		expect(files[0].path).toEqual(testFile);
		expect(files[0].buffer).not.toEqual(null);

		const stats = fs.statSync(testFile);
		if (files[0].buffer !== null) {
			expect(files[0].buffer.length).toEqual(stats.size);
		}
	});
});
