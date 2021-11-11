import { Time } from '..';

export interface Pos {
  line: number;
  column: number;
  char: number;
}

export interface Unit {
  unit: string;
  exp: number;
  multiplier: number;
  known: boolean;
  start?: Pos;
  end?: Pos;
}

export interface Units {
  type: 'units';
  args: Unit[];
  start?: Pos;
  end?: Pos;
}

export interface Def {
  type: 'def';
  args: [varName: string];
  start?: Pos;
  end?: Pos;
}

export interface Ref {
  type: 'ref';
  args: [varName: string];
  start?: Pos;
  end?: Pos;
}

export interface ExternalRef {
  type: 'externalref';
  args: [randomId: string];
  start?: Pos;
  end?: Pos;
}

export interface FuncRef {
  type: 'funcref';
  args: [functionName: string];
  start?: Pos;
  end?: Pos;
}

export interface FuncDef {
  type: 'funcdef';
  args: [functionName: string];
  start?: Pos;
  end?: Pos;
}

export interface ColDef {
  type: 'coldef';
  args: [colName: string];
  start?: Pos;
  end?: Pos;
}

export type Identifier = Ref | FuncRef | ExternalRef | Def | FuncDef | ColDef;

// Literal number, char, string etc

type LitArgs =
  | ['number', number, Units | null]
  | ['boolean', boolean, Units | null]
  | ['string', string, Units | null];

export interface Literal {
  type: 'literal';
  args: LitArgs;
  start?: Pos;
  end?: Pos;
}

export interface TimeQuantity {
  type: 'time-quantity';
  args: (Time.Unit | number)[];
  start?: Pos;
  end?: Pos;
}

export interface Range {
  type: 'range';
  args: [start: Expression, end: Expression];
  start?: Pos;
  end?: Pos;
}

export interface Sequence {
  type: 'sequence';
  args: [start: Expression, end: Expression, by: Expression];
  start?: Pos;
  end?: Pos;
}

export interface TZInfo {
  hours: number;
  minutes: number;
}

export interface Date {
  type: 'date';
  args: (Time.Unit | number | TZInfo)[];
  start?: Pos;
  end?: Pos;
}

// As

export interface As {
  type: 'as';
  args: [Expression, Units];
  start?: Pos;
  end?: Pos;
}

// Columns, tables
export interface ColumnItems {
  type: 'column-items';
  args: Expression[];
  start?: Pos;
  end?: Pos;
}

export interface Column {
  type: 'column';
  args: [items: ColumnItems];
  start?: Pos;
  end?: Pos;
}

export interface TableColumn {
  type: 'table-column';
  args: [name: ColDef, column: Expression];
  start?: Pos;
  end?: Pos;
}

export interface TableSpread {
  type: 'table-spread';
  args: [spreadTableRef: Ref];
  start?: Pos;
  end?: Pos;
}

export interface Table {
  type: 'table';
  args: (TableColumn | TableSpread)[];
  start?: Pos;
  end?: Pos;
}

export interface PropertyAccess {
  type: 'property-access';
  args: [Expression, string];
  start?: Pos;
  end?: Pos;
}

// Imported data
export interface ImportedData {
  type: 'imported-data';
  args: [string, string?];
  start?: Pos;
  end?: Pos;
}

// Function calls and operators

export interface ArgList {
  type: 'argument-list';
  args: Expression[];
  start?: Pos;
  end?: Pos;
}

export interface FunctionCall {
  type: 'function-call';
  args: [FuncRef, ArgList];
  start?: Pos;
  end?: Pos;
}

// Expansion operator

export interface Given {
  type: 'given';
  args: [ref: Ref, body: Expression];
  start?: Pos;
  end?: Pos;
}

// Definitions

export interface Assign {
  type: 'assign';
  args: [def: Def, assignee: Expression];
  start?: Pos;
  end?: Pos;
}

export interface FunctionArgumentNames {
  type: 'argument-names';
  args: Def[];
  start?: Pos;
  end?: Pos;
}

export interface FunctionDefinition {
  type: 'function-definition';
  args: [name: FuncDef, arguments: FunctionArgumentNames, body: Block];
  start?: Pos;
  end?: Pos;
}

// Groupings

export interface Block {
  type: 'block';
  id: string;
  args: Statement[];
  start?: Pos;
  end?: Pos;
}

export type Expression =
  | FunctionCall
  | Ref
  | ExternalRef
  | PropertyAccess
  | Literal
  | TimeQuantity
  | Column
  | Range
  | Sequence
  | Date
  | Given
  | Table
  | ImportedData
  | As;

export type Statement = FunctionDefinition | Assign | Expression;

type Lists = FunctionArgumentNames | ArgList | ColumnItems;

export type Node =
  | Block
  | Statement
  | Identifier
  | Lists
  | TableColumn
  | TableSpread
  | Units;

export interface TypeToNode {
  def: Def;
  ref: Ref;
  externalref: ExternalRef;
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
  'column-items': ColumnItems;
  column: Column;
  'table-column': TableColumn;
  'table-spread': TableSpread;
  table: Table;
  'property-access': PropertyAccess;
  assign: Assign;
  'argument-names': FunctionArgumentNames;
  'function-definition': FunctionDefinition;
  given: Given;
  block: Block;
  'imported-data': ImportedData;
  units: Units;
  as: As;
}
