node-djiparsetxt
================

![npm](https://img.shields.io/npm/v/node-djiparsetxt.svg)
![NPM](https://img.shields.io/npm/l/node-djiparsetxt.svg)

Decrypts and parse DJI logs and outputs csv files, along other things. Based on 
[`djiparsetxt`](http://djilogs.live555.com/).

This package requires node version 10 or older. Basically the stable release.

Usage
=====

## From the terminal

The main use case for is through a terminal to create json version of logs.

The cli's format is:

		node-djiparsetxt FILE [FILE...] [OPTIONS]

Type `node-djiparsetxt --help` for more info on options.


Example to create a json file from a text log:

		node-djiparsetxt log1.txt > log1.json

If you want to output csv:

		node-djiparsetxt log1.txt --csv > log1.csv

## From a script

`node-djiparsetxt` supports usage as a library to integrate it to a bigger 
workflow or to create batch processing of log files.

Example script that prints preformatted json file from a log file:

```javascript
const djiparsetxt = require('node-djiparsetxt');
const fs = require('fs');

const file_path = "path_to_log.txt";

fs.readFile(file_path, (err, data) => {
	if (err) throw err;
	console.log(JSON.stringify(djiparsetxt.parse_file(data), null, 4));
});
```

`node-djiparsetxt` Module
=========================

`parse_file(buf: Buffer, filter: (IRowObject) => boolean): IRowObject[]`

Parse a given buffer and return an array of `IRowObject` instances.

If a `filter` parameter is given, then only the rows that return `filter(row)` true
is returned in the array.

#### Parameters

- *`buf`*: `Buffer`: Buffer instance of the file to parse.
- *`filter`*: `(IRowObject) => boolean`: Filter function to specify what rows to include.

#### Returns

An array of with the rows extracted from the file.

----

`get_details(buf: Buffer): any`

Get the details section of the given file.

#### Parameters

- *`buf`*: `Buffer`: Buffer instance of the file to parse.

#### Returns 

An object with properties and values from the details area.

----

`get_header(buf: Buffer): IHeaderInfo`

Get the header of the given file.

#### Parameters

- *`buf`*: `Buffer`: Buffer instance of the file to parse.

#### Returns 

`IHeaderInfo` structure from the file.

----

`get_kml(buf: Buffer, image?: string, removeNoSignalRecords: boolean = false): Promise<string>`

Returns a kml string from a given file buffer.

#### Parameters

- *`buf`*: `Buffer`: Buffer instance of the file to parse.
- *`image?`*: `string`: Image to use as background for the kml.
- *`removeNoSignalRecords`*: `boolean`: If to remove rows where there was no GPS signal.

#### Returns

A `string` with the kml file.