import { ServiceTypes } from "../common/ServiceManager";
import BaseService from "./BaseService";
import { PARSER_TABLE } from "./BinaryParserTable";
import { RecordTypes } from "./RecordTypes";

export enum ParserTypes {
	Header = "header",
	BaseRecord = "base_record",
	StartRecord = "start_record",
	Details = "details",
	OsdRecord = "osd_record",
	HomeRecord = "home_record",
	GimbalRecord = "gimbal_record",
	RcRecord = "rc_record",
	CustomRecord = "custom_record",
	DeformRecord = "deform_record",
	CenterBatteryRecord = "center_battery_record",
	SmartBatteryRecord = "smart_battery_record",
	AppTipRecord = "app_tip_record",
	AppWarnRecord = "app_warn_record",
	RecoverRecord = "recover_record",
	AppGpsRecord = "app_gps_record",
	FirmwareRecord = "firmware_record",
}

export class BinaryParserService extends BaseService {

	/**
	 * Returns an instance of the requested parser by the type of parser.
	 * @param type Entry in ParserTypes enum for the requested parser.
	 */
	public get_parser(type: ParserTypes): any {
		if (PARSER_TABLE[type] == null) {
			return undefined;
		}

		if (PARSER_TABLE[type].instance == null) {
			const factory = PARSER_TABLE[type].factory;
			PARSER_TABLE[type].instance = factory();
		}

		return PARSER_TABLE[type].instance;
	}

	/**
	 * Returns an instance of a parser based on given record type. This
	 * parser should be able to parse the given record type.
	 * @param recordType The type of the record parsed by the parser.
	 */
	public get_record_parser(recordType: RecordTypes): any {
		const parserService = this.serviceMan.get_service(
			ServiceTypes.Parsers,
		) as BinaryParserService;

		const parserType = this.parser_record_mapping(recordType);

		if (parserType === null) {
			throw new Error(`record type '${recordType}' not recognized`);
		}

		return parserService.get_parser(parserType);
	}

	/**
	 * Mapping between record type and the parser that can parse them.
	 * @param recordType The type of the record to get its corresponding parser type.
	 */
	public parser_record_mapping(recordType: RecordTypes): ParserTypes | null {
		switch (recordType) {
			case RecordTypes.OSD:
				return ParserTypes.OsdRecord;
			case RecordTypes.CUSTOM:
				return ParserTypes.CustomRecord;
			case RecordTypes.RC:
				return ParserTypes.RcRecord;
			case RecordTypes.GIMBAL:
				return ParserTypes.GimbalRecord;
			case RecordTypes.HOME:
				return ParserTypes.HomeRecord;
			case RecordTypes.DEFORM:
				return ParserTypes.DeformRecord;
			case RecordTypes.CENTER_BATTERY:
				return ParserTypes.CenterBatteryRecord;
			case RecordTypes.SMART_BATTERY:
				return ParserTypes.SmartBatteryRecord;
			case RecordTypes.APP_TIP:
				return ParserTypes.AppTipRecord;
			case RecordTypes.APP_WARN:
				return ParserTypes.AppWarnRecord;
			case RecordTypes.RECOVER:
				return ParserTypes.RecoverRecord;
			case RecordTypes.APP_GPS:
				return ParserTypes.AppGpsRecord;
			case RecordTypes.FIRMWARE:
				return ParserTypes.FirmwareRecord;
			default:
				return null;
		}
	}
}
