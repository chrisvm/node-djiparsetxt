import { Version } from "../common/Version";
import { RecordTypes } from "../services/RecordTypes";

export interface IFile {
	path: string;
	buffer: Buffer | null;
}

export interface ILazyLoadingEntry<t = any> {
	instance: t | null;
	factory: (options?: any) => t;
}

export interface IRowObject {
	[type: string]: any;
}

export interface IRowHeader {
	type: string;
	props: string[];
}

export interface IHeaderInfo {
	file_size: number;
	header_size: number;
	records_size: number;
	details_size: number;
	version: Version;
}

export interface IFileInfo {
	header_info: IHeaderInfo;
	records_info: IRecordStats;
}

export interface IRecord {
	type: RecordTypes;
	length: number;
	data: Buffer[];
}

export interface IRecordStats {
	records_area_size: number;
	record_count: number;
	type_count: { [type: number]: number };
	invalid_records: number;
}

export interface IRecordCache {
	records: IRecord[];
	version: Version;
	stats: IRecordStats;
	isEmpty?: boolean;
}
