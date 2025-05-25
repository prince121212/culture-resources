declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  export interface WorkSheet {
    [cell: string]: CellObject | any;
  }

  export interface CellObject {
    v: any;
    t: string;
    f?: string;
    r?: string;
    h?: string;
    w?: string;
  }

  export interface ReadingOptions {
    type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array' | 'string';
    raw?: boolean;
    codepage?: number;
    cellFormula?: boolean;
    cellHTML?: boolean;
    cellNF?: boolean;
    cellStyles?: boolean;
    cellText?: boolean;
    cellDates?: boolean;
    dateNF?: string;
    sheetStubs?: boolean;
    sheetRows?: number;
    bookDeps?: boolean;
    bookFiles?: boolean;
    bookProps?: boolean;
    bookSheets?: boolean;
    bookVBA?: boolean;
    password?: string;
    WTF?: boolean;
  }

  export interface JSON2SheetOpts {
    header?: string[];
    dateNF?: string;
    cellDates?: boolean;
    skipHeader?: boolean;
  }

  export interface Sheet2JSONOpts {
    header?: number | string | string[];
    range?: any;
    raw?: boolean;
    defval?: any;
    blankrows?: boolean;
    dateNF?: string;
  }

  export const utils: {
    sheet_to_json<T = any>(worksheet: WorkSheet, opts?: Sheet2JSONOpts): T[];
    json_to_sheet<T = any>(json: T[], opts?: JSON2SheetOpts): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name?: string): void;
    aoa_to_sheet<T = any>(aoa: T[][], opts?: JSON2SheetOpts): WorkSheet;
  };

  export function read(data: any, opts?: ReadingOptions): WorkBook;
  export function readFile(filename: string, opts?: ReadingOptions): WorkBook;
  export function write(workbook: WorkBook, opts?: any): any;
  export function writeFile(workbook: WorkBook, filename: string, opts?: any): void;
}
