import Fraction from '@decipad/fraction';
import { Time } from '..';

export interface Pos {
  line: number;
  column: number;
  char: number;
}

export interface Def {
  type: 'def';
  args: [varName: string];
  start?: Pos;
  end?: Pos;
}

export interface CatDef {
  type: 'catdef';
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

export type Identifier =
  | Ref
  | FuncRef
  | ExternalRef
  | GenericIdentifier
  | Def
  | CatDef
  | FuncDef
  | ColDef;

// Literal number, char, string etc

type LitArgs = ['number', Fraction] | ['boolean', boolean] | ['string', string];

export interface Literal {
  type: 'literal';
  args: LitArgs;
  start?: Pos;
  end?: Pos;
}

export interface Range {
  type: 'range';
  args: [start: Expression, end: Expression];
  start?: Pos;
  end?: Pos;
}

type SequenceArgs =
  | [start: Expression, end: Expression, by: Expression]
  | [start: Expression, end: Expression];

export interface Sequence {
  type: 'sequence';
  args: SequenceArgs;
  start?: Pos;
  end?: Pos;
}

export interface TZInfo {
  hours: number;
  minutes: number;
}

export interface Date {
  type: 'date';
  args: (Time.Unit | bigint | TZInfo)[];
  start?: Pos;
  end?: Pos;
}

// Directives

export interface Directive {
  type: 'directive';
  args: [string, ...Node[]];
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
  args: [items: ColumnItems, indexName?: GenericIdentifier];
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

// Matrix stuff

export interface MatrixAssign {
  type: 'matrix-assign';
  args: [def: Def, where: MatrixMatchers, assignee: Expression];
  start?: Pos;
  end?: Pos;
}

export interface MatrixRef {
  type: 'matrix-ref';
  args: [ref: Ref, where: MatrixMatchers];
  start?: Pos;
  end?: Pos;
}

export interface MatrixMatchers {
  type: 'matrix-matchers';
  args: Expression[];
  start?: Pos;
  end?: Pos;
}

// Sets

export interface Categories {
  type: 'categories';
  args: [setName: CatDef, setContents: Expression];
  start?: Pos;
  end?: Pos;
}

// Generic stuff

export interface GenericIdentifier {
  type: 'generic-identifier';
  args: [name: string];
  start?: Pos;
  end?: Pos;
}

export interface GenericList {
  type: 'generic-list';
  args: Node[];
  start?: Pos;
  end?: Pos;
}

// Imported data

export interface FetchData {
  type: 'fetch-data';
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
  | Column
  | Range
  | Sequence
  | Date
  | Table
  | FetchData
  | Directive
  | MatrixRef;

export type Statement =
  | FunctionDefinition
  | Assign
  | MatrixAssign
  | Categories
  | Expression;

type Lists =
  | FunctionArgumentNames
  | ArgList
  | ColumnItems
  | GenericList
  | MatrixMatchers;

export type Node =
  | Block
  | Statement
  | Identifier
  | Lists
  | TableColumn
  | TableSpread;

export interface TypeToNode {
  directive: Directive;
  def: Def;
  catdef: CatDef;
  ref: Ref;
  externalref: ExternalRef;
  'generic-identifier': GenericIdentifier;
  funcref: FuncRef;
  funcdef: FuncDef;
  coldef: ColDef;
  literal: Literal;
  'argument-list': ArgList;
  'function-call': FunctionCall;
  range: Range;
  sequence: Sequence;
  date: Date;
  'column-items': ColumnItems;
  column: Column;
  'generic-list': GenericList;
  'table-column': TableColumn;
  'table-spread': TableSpread;
  table: Table;
  'property-access': PropertyAccess;
  'matrix-ref': MatrixRef;
  'matrix-assign': MatrixAssign;
  'matrix-matchers': MatrixMatchers;
  categories: Categories;
  assign: Assign;
  'argument-names': FunctionArgumentNames;
  'function-definition': FunctionDefinition;
  block: Block;
  'fetch-data': FetchData;
}
