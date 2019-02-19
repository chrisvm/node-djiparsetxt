import BaseService from './BaseService';
import { Parser } from 'binary-parser';
import { ILazyLoadingEntry } from '../common/lazy_loading';

import * as BigNum from 'bignum';

export enum ParserTypes 
{
  Header = 'header',
  BaseRecord = 'base_record',
  StartRecord = 'start_record',
	Details = 'details',
	OsdRecord = 'osd_record'
}

export function bignum_convert_buffer (buffer: any): BigNum
{
  return BigNum.fromBuffer(buffer as Buffer, {endian: 'little', size: 8});
}

export class BinaryParserService extends BaseService {

  private parser_table: {[type: string]: ILazyLoadingEntry<any>} = {
    header: {
      instance: null,
      factory: () => {
        return new Parser()
          .uint32le('header_record_size_lo')
          .uint32le('header_record_size_hi')
          .uint32le('file_version')
          .buffer('unused', {
            length: 88
          });
      }
    },
    base_record: {
      instance: null,
      factory: () => {
        return new Parser()
          .uint8('type')
          .uint8('length')
          .buffer('data', {
            length: 'length'
          })
          .uint8('marker');
      }
    },
    start_record: {
      instance: null,
      factory: () => {
        return new Parser()
          .uint8('type')
          .uint8('length');
      }
    },
    details: {
      instance: null,
      factory: () => {
        return new Parser()
          .buffer('city_part', {
            length: 20,
            formatter: (dat) =>(dat as Buffer).toString('ascii')
          })
          .buffer('street', {
            length: 20,
            formatter: (dat) =>(dat as Buffer).toString('ascii')
          })
          .buffer('city', {
            length: 20,
            formatter: (dat) =>(dat as Buffer).toString('ascii')
          })
          .buffer('area', {
            length: 20,
            formatter: (dat) =>(dat as Buffer).toString('ascii')
          })
          .uint8('is_favorite')
          .uint8('is_new')
          .uint8('needs_upload')
          .uint32le('record_line_count')
          .uint32('unknown')
          .buffer('timestamp', {length: 8})
          .doublele('longitude')
          .doublele('latitude')
          .floatle('total_distance')
          .floatle('total_time', {
            formatter: (time) => (time as number) * 1000
          })
          .floatle('max_height')
          .floatle('max_hor_speed')
          .floatle('max_vert_speed')
          .uint32le('photo_count')
          .uint32le('video_time');
        // todo: finish implementing parser for diff versions
			},
		},
		osd_record: {
			instance: null,
			factory: () => {
				return new Parser()
					.doublele('longitude')
					.doublele('latitude')
					.int16le('height')
					.int16le('x_speed')
					.int16le('y_speed')
					.int16le('z_speed')
					.int16le('pitch')
					.int16le('roll')
					.int16le('yaw')
					.bit1('rc_state')
					.bit7('fly_state')
					.uint8('fly_command')
					.bit3('go_home_status')
					.bit1('is_swave_work')
					.bit1('is_motor_up')
					.bit2('ground_or_sky')
					.bit1('can_ioc_work')
					.bit1('unknown')
					.bit2('mode_channel')
					.bit1('is_imu_preheated')
					.bit1('unknown')
					.bit2('voltage_warning')
					.bit1('is_vision_used')
					.bit2('battery_type')
					.bit4('gps_level')
					.bit1('wave_error')
					.bit1('compass_error')
					.bit1('is_accelerator_over_range')
					.bit1('is_vibrating')
					.bit1('is_barometer_dead_in_air')
					.bit1('is_motor_blocked')
					.bit1('is_not_enough_force')
					.bit1('is_propeller_catapult')
					.bit1('is_go_home_height_modified')
					.bit1('is_out_of_limit')
					.uint8('gps_num')
					.uint8('flight_action')
					.uint8('motor_start_failed_cause')
					.bit3('unknown')
					.bit1('waipoint_limit_mode')
					.bit4('non_gps_cause')
					.uint8('battery')
					.uint8('swave_height')
					.uint16le('fly_time')
					.uint8('motor_revolution')
					.uint16('unknown')
					.uint8('flyc_version')
					.uint8('drone_type')
					.uint8('imu_init_fail_reason');
					// todo: deal with file versions
			}
		}
  };
  
  public get_parser(type: ParserTypes): any 
  {
    if (this.parser_table[type] == null) {
      return undefined;
    }

    if (this.parser_table[type].instance == null) {
      const factory = this.parser_table[type].factory;
      this.parser_table[type].instance = factory();
    }

    return this.parser_table[type].instance;
  }
}