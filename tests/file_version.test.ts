import path from "path";
import fs from "fs";
import { expect } from "chai";
import { parse_file } from "../src/node-djiparsetxt";

describe('Mavic 2 Log Test', () => {
	const filesDir = path.join(__dirname, '../assets/flight_logs/mavic2');
	const fileList = fs.readdirSync(filesDir);
	
	for (let fileName of fileList) {
		it(`should parse file ${fileName}`, () => {
			fileName = path.join(filesDir, fileName);
			const buffer = fs.readFileSync(fileName);
			const rows = parse_file(buffer);
			
			expect(rows).to.be.an("array");
			expect(rows.length).to.be.greaterThan(0);
		});
	}
});

describe('Phantom 3 Log Test', () => {
	const filesDir = path.join(__dirname, '../assets/flight_logs/phantom3');
	const fileList = fs.readdirSync(filesDir);
	
	for (let fileName of fileList) {
		it(`should parse file ${fileName}`, () => {
			fileName = path.join(filesDir, fileName);
			const buffer = fs.readFileSync(fileName);
			const rows = parse_file(buffer);
			
			expect(rows).to.be.an("array");
			expect(rows.length).to.be.greaterThan(0);
		});
	}
});

describe('Phantom 4 Log Test', () => {
	const filesDir = path.join(__dirname, '../assets/flight_logs/phantom4');
	const fileList = fs.readdirSync(filesDir);
	
	for (let fileName of fileList) {
		it(`should parse file ${fileName}`, () => {
			fileName = path.join(filesDir, fileName);
			const buffer = fs.readFileSync(fileName);
			const rows = parse_file(buffer);
			
			expect(rows).to.be.an("array");
			expect(rows.length).to.be.greaterThan(0);
		});
	}
});