import BaseService from './BaseService';
import { Parser } from 'binary-parser';
import * as BigNum from 'bignum';

export enum ParserTypes 
{
  Header = 'header',
  BaseRecord = 'base_record',
  StartRecord = 'start_record',
  Details = 'details'
}

interface ParserTableEntry
{
  parser: any;
  factory: () => any;
}

export function bignum_convert_buffer (buffer: any): BigNum
{
  return BigNum.fromBuffer(buffer as Buffer, {endian: 'little', size: 8});
}

export class BinaryParserService extends BaseService {
  public name: string = 'parsers';

  private parser_table: {[type: string]: ParserTableEntry} = {
    header: {
      parser: null,
      factory: () => {
        return new Parser()
          .uint32le('header_record_size_lo')
          .uint32le('header_record_size_hi')
          .uint32le('file_version')
          .array('unused', {
            type: 'uint8',
            length: 88
          });
      }
    },
    base_record: {
      parser: null,
      factory: () => {
        return new Parser()
          .uint8('type')
          .uint8('length')
          .array('data', {
            type: 'uint8',
            length: 'length'
          })
          .uint8('marker');
      }
    },
    start_record: {
      parser: null,
      factory: () => {
        return new Parser()
          .uint8('type')
          .uint8('length');
      }
    },
    details: {
      parser: null,
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
      }
    }
  };
  
  public get_parser(type: ParserTypes): any 
  {
    if (this.parser_table[type] == null) {
      return undefined;
    }

    if (this.parser_table[type].parser == null) {
      const factory = this.parser_table[type].factory;
      this.parser_table[type].parser = factory();
    }

    return this.parser_table[type].parser;
  }
}