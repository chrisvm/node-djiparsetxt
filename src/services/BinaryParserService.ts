import BaseService from './BaseService';
import { Parser } from 'binary-parser';

export enum ParserTypes 
{
  Header = 'header',
  BaseRecord = 'base_record',
  StartRecord = 'start_record'
}

interface ParserTableEntry
{
  parser: any;
  factory: () => any;
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