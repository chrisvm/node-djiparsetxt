#!/usr/bin/env node
import {main_entry} from './main_entry';

// main function
(function main () {
	const process_name = 'node-djiparsetxt';
	const args = process.argv.slice(2);
	try {
		main_entry(args);
	}
	catch (e) {
		console.log(`${process_name}: ${e}`);
	}
})();