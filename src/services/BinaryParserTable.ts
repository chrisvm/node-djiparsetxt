import bignum = require("bignum");
import { Parser } from "binary-parser";
import { ILazyLoadingEntry } from "../common/lazy_loading";
import { parse } from "path";

export interface IParserLookUpTable {
	[type: string]: ILazyLoadingEntry;
}

export function bignum_convert_buffer(buffer: any): bignum {
	return bignum.fromBuffer(buffer as Buffer, { endian: "little", size: 8 });
}

export const PARSER_TABLE: IParserLookUpTable = {
	header: {
		instance: null,
		factory: () => {
			return new Parser()
				.uint32le("header_record_size_lo")
				.uint32le("header_record_size_hi")
				.buffer("file_version", { length: 4 })
				.skip(88);
		},
	},
	base_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.uint8("type")
				.uint8("length")
				.buffer("data", {
					length: "length",
				})
				.uint8("marker");
		},
	},
	start_record: {
		instance: null,
		factory: () => {
			return new Parser().uint8("type").uint8("length");
		},
	},
	details: {
		instance: null,
		factory: () => {
			return new Parser()
				.buffer("city_part", {
					length: 20,
					formatter: (dat) => (dat as Buffer).toString("ascii"),
				})
				.buffer("street", {
					length: 20,
					formatter: (dat) => (dat as Buffer).toString("ascii"),
				})
				.buffer("city", {
					length: 20,
					formatter: (dat) => (dat as Buffer).toString("ascii"),
				})
				.buffer("area", {
					length: 20,
					formatter: (dat) => (dat as Buffer).toString("ascii"),
				})
				.uint8("is_favorite")
				.uint8("is_new")
				.uint8("needs_upload")
				.uint32le("record_line_count")
				.skip(4)
				.buffer("timestamp", { length: 8 })
				.doublele("longitude")
				.doublele("latitude")
				.floatle("total_distance")
				.floatle("total_time", {
					formatter: (time) => (time as number) * 1000,
				})
				.floatle("max_height")
				.floatle("max_hor_speed")
				.floatle("max_vert_speed")
				.uint32le("photo_count")
				.uint32le("video_time");
			// todo: finish implementing parser for diff versions
		},
	},
	osd_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.doublele("longitude")
				.doublele("latitude")
				.int16le("height")
				.int16le("x_speed")
				.int16le("y_speed")
				.int16le("z_speed")
				.int16le("pitch")
				.int16le("roll")
				.int16le("yaw")
				.bit1("rc_state")
				.bit7("fly_state")
				.uint8("fly_command")
				.bit3("go_home_status")
				.bit1("is_swave_work")
				.bit1("is_motor_up")
				.bit2("ground_or_sky")
				.bit1("can_ioc_work")
				.bit1("unknown")
				.bit2("mode_channel")
				.bit1("is_imu_preheated")
				.bit1("unknown")
				.bit2("voltage_warning")
				.bit1("is_vision_used")
				.bit2("battery_type")
				.bit4("gps_level")
				.bit1("wave_error")
				.bit1("compass_error")
				.bit1("is_accelerator_over_range")
				.bit1("is_vibrating")
				.bit1("is_barometer_dead_in_air")
				.bit1("is_motor_blocked")
				.bit1("is_not_enough_force")
				.bit1("is_propeller_catapult")
				.bit1("is_go_home_height_modified")
				.bit1("is_out_of_limit")
				.uint8("gps_num")
				.uint8("flight_action")
				.uint8("motor_start_failed_cause")
				.bit3("unknown")
				.bit1("waipoint_limit_mode")
				.bit4("non_gps_cause")
				.uint8("battery")
				.uint8("swave_height")
				.uint16le("fly_time")
				.uint8("motor_revolution")
				.skip(2)
				.uint8("flyc_version")
				.uint8("drone_type")
				.uint8("imu_init_fail_reason");
			// todo: deal with file versions
		},
	},
	custom_record: {
		instance: null,
		factory: () => {
			const dummy: any = {
				parser: new Parser()
					.skip(2)
					.floatle("hspeed")
					.floatle("distance")
					.buffer("updateTime", { length: 8 }),
			};

			// override the parse method to also convert the buffer
			// into a bignum obj
			dummy.parse = (buf: Buffer): any => {
				const parsed = dummy.parser.parse(buf);
				const updateTime = bignum_convert_buffer(parsed.updateTime);
				parsed.updateTime = updateTime.toString();
				return parsed;
			};

			return dummy;
		},
	},
	rc_record: {
		instance: null,
		factory: () => {
			// todo: implement data transformations
			return new Parser()
				.int16le("aileron", {
					formatter: (val: any) => (val - 1024) / 0.066,
				})
				.int16le("elevator", {
					formatter: (val: any) => (val - 1024) / 0.066,
				})
				.int16le("throttle", {
					formatter: (val: any) => (val - 1024) / 0.066,
				})
				.int16le("rudder", {
					formatter: (val: any) => (val - 1024) / 0.066,
				})
				.int16le("gimbal", {
					formatter: (val: any) => (val - 1024) / 0.066,
				})
				.bit2("unknown")
				.bit5("wheel_offset")
				.bit1("unknown")
				.bit2("unknown")
				.bit2("mode")
				.bit1("go_home")
				.bit3("unknown")
				.bit3("unknown")
				.bit1("custom2")
				.bit1("custom1")
				.bit1("playback")
				.bit1("shutter")
				.bit1("record");
		},
	},
	gimbal_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.int16le("pitch", { formatter: (val: any) => val / 10 })
				.int16le("roll", { formatter: (val: any) => val / 10 })
				.int16le("yaw", { formatter: (val: any) => val / 10 })
				.bit2("mode")
				.bit6("unknown")
				.int8("roll_adjust", { formatter: (val: any) => val / 10 })
				.int16le("yaw_angle", { formatter: (val: any) => val / 10 })
				.bit1("is_pitch_in_limit")
				.bit1("is_roll_in_limit")
				.bit1("is_yaw_in_limit")
				.bit1("is_auto_calibration")
				.bit1("auto_calibration_results")
				.bit1("unknown")
				.bit1("is_stuck")
				.bit1("unknown")
				.bit1("is_single_click")
				.bit1("is_triple_click")
				.bit1("is_double_click")
				.bit1("unknown")
				.bit4("version");
		},
	},
	home_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.doublele("longitude")
				.doublele("latitude")
				.int16le("height", { formatter: (val: any) => val / 10 })
				.bit1("has_go_home")
				.bit3("go_home_status")
				.bit1("is_dyn_home_point_enabled")
				.bit1("aircraft_head_direction")
				.bit1("go_home_mode")
				.bit1("is_home_record")
				.bit3("ioc_mode")
				.bit1("ioc_enabled")
				.bit1("is_beginners_mode")
				.bit1("is_compass_celeing")
				.bit2("compass_cele_status")
				.uint16le("go_home_height")
				.int16le("course_lock_angle", {
					formatter: (val: any) => val / 10,
				})
				.uint8("data_recorder_status")
				.uint8("data_recorder_remain_capacity")
				.uint16le("data_recorder_remain_time")
				.uint16le("data_recorder_file_index");
		},
	},
	deform_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.bit2("unknown")
				.bit2("deform_mode")
				.bit3("deform_status")
				.bit1("is_deform_protected");
		},
	},
	center_battery_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.uint8("relative_capacity")
				.uint16le("current_pv", { formatter: (val: any) => val / 1000 })
				.uint16le("current_capacity")
				.uint16le("full_capacity")
				.uint8("life")
				.uint16le("loop_num")
				.uint32le("error_type")
				.uint16le("current", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_1", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_2", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_3", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_4", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_5", { formatter: (val: any) => val / 1000 })
				.uint16le("voltage_cel_6", { formatter: (val: any) => val / 1000 })
				.uint16le("serial_no")
				.uint16le("product_date", {
					formatter: (val: any) => {
						return {
							year: ((val & 0xfe00) >> 9) + 1980,
							month: (val & 0x01e0) >> 5,
							day: val & 0x001f,
						};
					},
				})
				.uint16le("temperature", { formatter: (val: any) => val / 100 })
				.uint8("conn_status");
		},
	},
	smart_battery_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.uint16le("useful_time")
				.uint16le("go_home_time")
				.uint16le("land_time")
				.uint16le("go_home_battery")
				.uint16le("landing_battery")
				.uint32le("safe_fly_radius")
				.floatle("volume_console")
				.uint32le("status")
				.uint8("go_home_status")
				.uint8("go_home_countdown")
				.uint16le("voltage", { formatter: (val: any) => val / 1000 })
				.uint8("battery")
				.bit1("low_warning_go_home")
				.bit7("low_warning")
				.bit1("serious_low_warning_landing")
				.bit7("serious_low_warning")
				.uint8("voltage_percent");
		},
	},
	app_tip_record: {
		instance: null,
		factory: () => {
			return new Parser().string("tip", { zeroTerminated: true });
		},
	},
	app_warn_record: {
		instance: null,
		factory: () => {
			return new Parser().string("warn", { zeroTerminated: true });
		},
	},
	recover_record: {
		instance: null,
		factory: () => {
			// todo: implement versioning for this record
			const dummy: any = {
				parser: new Parser()
					.uint8("drone_type")
					.uint8("app_type")
					.buffer("app_version", { length: 3 })
					.string("aircraft_sn", { length: 10 })
					.string("aircraft_name", { length: 24 })
					.skip(22)
					.string("camera_sn", { length: 10 })
					.string("rc_sn", { length: 10 })
					.string("battery_sn", { length: 10 }),
			};

			dummy.parse = (buf: Buffer): any => {
				const parsed = dummy.parser.parse(buf);
				const appVer = parsed.app_version;
				parsed.app_version = `${appVer[2]}.${appVer[1]}.${appVer[0]}`;
				return parsed;
			};

			return dummy;
		},
	},
	app_gps_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.doublele("latitude")
				.doublele("longitude")
				.floatle("accuracy");
		},
	},
	firmware_record: {
		instance: null,
		factory: () => {
			return new Parser()
				.skip(2)
				.buffer("version", { length: 3 })
				.skip(109);
		},
	},
};