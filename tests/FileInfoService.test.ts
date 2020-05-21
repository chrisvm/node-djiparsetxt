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
		it("should correctly parse strings without null char", () => {
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
			
			const deets = fileInfoService.get_details(fileBuff);

			expect(deets).not.toEqual(null);

			for (const prop of stringProps) {
				const val = deets[prop];
				expect(typeof val).toBe("string");
				expect(val).not.toEqual("\u0000");
			}
		});
	});
});
