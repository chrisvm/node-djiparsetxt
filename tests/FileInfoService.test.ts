import { expect } from "chai";
import fs from "fs";
import path from "path";
import { FileInfoService } from "../src/services/FileInfoService";
import { ServiceManagerMock } from "./ServiceManager.mock";

describe("FileInfoService", () => {
	const filePath = path.join(__dirname, "../assets/flight_logs/mavic2/mavic2_0.txt");
	const fileBuff = fs.readFileSync(filePath);
	const serviceMan = new ServiceManagerMock();
	const fileInfoService = new FileInfoService(serviceMan);

	describe("File Details", () => {
		const stringProps: string[] = [
			"city_part",
			"street",
			"city",
			"area",
			"aircraft_name",
			"aircraft_sn",
			"camera_sn",
			"rc_sn",
			"battery_sn",
		];
		it("should correctly parse strings without null char", () => {
			const deets = fileInfoService.get_details(fileBuff);

			expect(deets).to.not.equal(null);

			for (const prop of stringProps) {
				const val = deets[prop];
				expect(val).to.be.a("string");
				expect(val).to.not.have.string("\u0000");
			}
		});
	});
});
