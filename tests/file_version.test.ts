import fs from "fs";
import path from "path";
import { parse_file, IRowObject } from "../src/node-djiparsetxt";

const junk = (item: string) => !(/(^|\/)\.[^\/\.]/g).test(item);

describe("Mavic 2 Log Tests", () => {
	const filesDir = path.join(__dirname, "../assets/flight_logs/mavic2");
	createTestFromDir(filesDir);
});

describe("Phantom 3 Log Tests", () => {
	const filesDir = path.join(__dirname, "../assets/flight_logs/phantom3");
	createTestFromDir(filesDir);
});

describe("Phantom 4 Log Tests", () => {
	const filesDir = path.join(__dirname, "../assets/flight_logs/phantom4");
	createTestFromDir(filesDir);
});

describe("Spark Log Tests", () => {
	const filesDir = path.join(__dirname, "../assets/flight_logs/spark");
	createTestFromDir(filesDir);
});

function filterFromKeys(row: IRowObject, keys: string[]): IRowObject {
	const filtered: IRowObject = { filterCount: 0 };

	if (keys.length == 0) return filtered;

	for (let key of keys) {
		if (key in row) {
			filtered[key] = row[key];
			filtered.filterCount += 1;
		}
	}

	return filtered;
}

function createTestFromDir(filePath: string) {
	const fileList = fs.readdirSync(filePath).filter(junk);

	for (let fileName of fileList) {
		describe(fileName, () => {
			// parse file for this tests
			const completeFileName = path.join(filePath, fileName);
			const buffer = fs.readFileSync(completeFileName);
			const rows = parse_file(buffer);

			it(`should parse file '${fileName}'`, () => {
				expect(Array.isArray(rows)).toBe(true);
				expect(rows.length).toBeGreaterThan(0);
				for (const row of rows) {
					expect(row).toHaveProperty("OSD");
				}
			});

			it('should remove the intial garbage created by the APP_GPS data (remove [0, 0] intial coord)', () => {
				for (let row of rows) {
					const key = 'APP_GPS';
					if (key in row) {
						const gps = row[key];
						expect(Math.abs(gps.latitude)).toBeGreaterThan(0.0);
						expect(Math.abs(gps.longitude)).toBeGreaterThan(0.0);
					}
				}
			});

			it('should not have values for gps that are exactly 0 in OSD record',  () => {
				for (let row of rows) {
					const key = 'OSD';
					if (key in row) {
						const gps = row[key];
						expect(Math.abs(gps.latitude)).toBeGreaterThan(0.0);
						expect(Math.abs(gps.longitude)).toBeGreaterThan(0.0);
					}
				}
			});
		});
	}
}