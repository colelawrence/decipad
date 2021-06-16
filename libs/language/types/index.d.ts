declare module '../src/grammar';

declare namespace Parser {
  interface UnparsedBlock {
    id: string;
    source: string;
  }

  interface ParserError {
    message: string;
    details: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  }

  interface ParsedBlock {
    id: string;
    solutions: Solution[];
    errors: ParserError[];
  }

  type Solution = AST.Block;
}

declare namespace Time {
  /**
   * A unit of time available for time quantities in the language (eventually dates too)
   */
  type Unit =
    | 'year'
    | 'quarter'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond';

  /**
   * The arguments to JavaScript's new Date() or Date.UTC
   */
  type JSDateUnit =
    | 'year'
    | 'month'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond';

  /**
   * Specificity of a date in the language. quarter, week get turned into months, days. hours, minutes etc get turned into "time" because to the language all the time of day is the same type.
   */
  type Specificity = 'year' | 'month' | 'day' | 'time';
}

declare namespace AST {
  interface Pos {
    line: number;
    column: number;
    char: number;
  }

  interface Unit {
    unit: string;
    exp: number;
    multiplier: number;
    known: boolean;
    start: Pos;
    end: Pos;
  }

  interface Def {
    type: 'def';
    args: [varName: string];
    start: Pos;
    end: Pos;
  }

  interface Ref {
    type: 'ref';
    args: [varName: string];
    start: Pos;
    end: Pos;
  }

  interface FuncRef {
    type: 'funcref';
    args: [functionName: string];
    start: Pos;
    end: Pos;
  }

  interface FuncDef {
    type: 'funcdef';
    args: [functionName: string];
    start: Pos;
    end: Pos;
  }

  interface ColDef {
    type: 'coldef';
    args: [colName: string];
    start: Pos;
    end: Pos;
  }

  type Identifier = Ref | FuncRef | Def | FuncDef | ColDef;

  // Literal number, char, string etc

  type LitArgs = ['number', number] | ['boolean', boolean] | ['string', string];

  interface Literal {
    type: 'literal';
    args: [...LitArgs, unit: Unit[] | null];
    type?: Type; // TODO
    start: Pos;
    end: Pos;
  }

  interface TimeQuantity {
    type: 'time-quantity';
    args: (Time.Unit | number)[];
    start: Pos;
    end: Pos;
  }

  interface Range {
    type: 'range';
    args: [start: Expression, end: Expression];
    start: Pos;
    end: Pos;
  }

  interface Sequence {
    type: 'sequence';
    args: [start: Expression, end: Expression, by: Expression];
    start: Pos;
    end: Pos;
  }

  type DateSegments = (Time.Unit | number)[];
  interface TZInfo {
    hours: number;
    minutes: number;
  }

  interface Date {
    type: 'date';
    args: [...DateSegments, tz?: TZInfo];
    start: Pos;
    end: Pos;
  }

  // Columns, tables
  interface Column {
    type: 'column';
    args: [contents: Expression[]];
    start: Pos;
    end: Pos;
  }

  interface Table {
    type: 'table';
    args: (ColDef | Expression)[];
    start: Pos;
    end: Pos;
  }

  interface PropertyAccess {
    type: 'property-access';
    args: [Ref, string];
    start: Pos;
    end: Pos;
  }

  // Imported data
  interface ImportedData {
    type: 'imported-data';
    args: [string, string?];
  }

  // Function calls and operators

  interface ArgList {
    type: 'argument-list';
    args: Expression[];
    start: Pos;
    end: Pos;
  }

  interface FunctionCall {
    type: 'function-call';
    args: [FuncRef, ArgList];
    start: Pos;
    end: Pos;
  }

  // Expansion operator

  interface Given {
    type: 'given';
    args: [ref: Ref, body: Expression];
    start: Pos;
    end: Pos;
  }

  // Definitions

  interface Assign {
    type: 'assign';
    args: [def: Def, assignee: Expression];
    start: Pos;
    end: Pos;
  }

  interface FunctionArgumentNames {
    type: 'argument-names';
    args: Def[];
    start: Pos;
    end: Pos;
  }

  interface FunctionDefinition {
    type: 'function-definition';
    args: [name: FuncDef, arguments: FunctionArgumentNames, body: Block];
    start: Pos;
    end: Pos;
  }

  // Groupings

  interface Block {
    type: 'block';
    id: string;
    args: Statement[];
    start: Pos;
    end: Pos;
  }

  type Expression =
    | FunctionCall
    | Ref
    | PropertyAccess
    | Literal
    | TimeQuantity
    | Column
    | Range
    | Sequence
    | Date
    | Given
    | Table
    | ImportedData;

  type Statement = FunctionDefinition | Assign | Expression;

  type Lists = FunctionArgumentNames | ArgList;

  type Node = Block | Statement | Identifier | Lists;

  interface TypeToNode {
    def: Def;
    ref: Ref;
    funcref: FuncRef;
    funcdef: FuncDef;
    coldef: ColDef;
    literal: Literal;
    'time-quantity': TimeQuantity;
    'argument-list': ArgList;
    'function-call': FunctionCall;
    range: Range;
    sequence: Sequence;
    date: Date;
    column: Column;
    table: Table;
    'property-access': PropertyAccess;
    assign: Assign;
    'argument-names': FunctionArgumentNames;
    'function-definition': FunctionDefinition;
    given: Given;
    block: Block;
    'imported-data': ImportedData;
  }
}

declare namespace Interpreter {
  type ResultScalar = number | boolean | string;
  type ResultColumn = OneResult[];

  type OneResult = ResultScalar | ResultColumn;
  type Result = OneResult[];
}

type Type = import('../src/type').Type;
type TableType = import('../src/type').TableType;
interface Result {
  type: Type | TableType;
  value: Interpreter.Result;
}

declare namespace ExternalData {
  interface FetchResult {
    contentType: string | null;
    result: AsyncIterable<Uint8Array>;
  }
  type FetchFunction = (url: string) => Promise<FetchResult>;
}
