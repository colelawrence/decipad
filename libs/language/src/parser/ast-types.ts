import DeciNumber from '@decipad/number';
import { Time, Type } from '..';

interface BasicNode {
  cacheKey?: string;
  start?: Pos;
  end?: Pos;
  inferredType?: Type;
}

export interface Pos {
  line: number;
  column: number;
  char: number;
}

export interface Noop extends BasicNode {
  type: 'noop';
  args: [];
}

export interface Def extends BasicNode {
  type: 'def';
  args: [varName: string];
}

export interface TableDef extends BasicNode {
  type: 'tabledef';
  args: [varName: string];
}

/** The table part of a table column definition */
export interface TablePartialDef extends BasicNode {
  type: 'tablepartialdef';
  args: [tableName: string];
}

export interface CatDef extends BasicNode {
  type: 'catdef';
  args: [varName: string];
}

export interface Ref extends BasicNode {
  type: 'ref';
  args: [varName: string];
}

export interface ExternalRef extends BasicNode {
  type: 'externalref';
  args: [randomId: string];
}

export interface FuncRef extends BasicNode {
  type: 'funcref';
  args: [functionName: string];
}

export interface FuncDef extends BasicNode {
  type: 'funcdef';
  args: [functionName: string];
}

export interface ColDef extends BasicNode {
  type: 'coldef';
  args: [colName: string];
}

export interface ColRef extends BasicNode {
  type: 'colref';
  args: [colName: string];
}

export type Identifier =
  | Ref
  | FuncRef
  | ExternalRef
  | GenericIdentifier
  | Def
  | TableDef
  | TablePartialDef
  | CatDef
  | FuncDef
  | ColDef
  | ColRef;

// Literal number, char, string etc

export type NumberFormat = undefined | 'percentage';
type LitArgs =
  | ['number', DeciNumber, NumberFormat?]
  | ['boolean', boolean]
  | ['string', string];

export interface Literal extends BasicNode {
  type: 'literal';
  args: LitArgs;
}

export interface Range extends BasicNode {
  type: 'range';
  args: [start: Expression, end: Expression];
}

type SequenceArgs =
  | [start: Expression, end: Expression, by: Expression]
  | [start: Expression, end: Expression];

export interface Sequence extends BasicNode {
  type: 'sequence';
  args: SequenceArgs;
}

export interface TZInfo {
  hours: number;
  minutes: number;
}

export interface Date extends BasicNode {
  type: 'date';
  args: (Time.Unit | bigint | TZInfo | undefined)[];
}

// Directives

export interface AsDirective extends BasicNode {
  type: 'directive';
  args: ['as', Expression, Expression];
}

export interface OfDirective extends BasicNode {
  type: 'directive';
  args: ['of', Expression, GenericIdentifier];
}

export interface OverDirective extends BasicNode {
  type: 'directive';
  args: ['over', Expression, GenericIdentifier];
}

/** @deprecated */
export interface SelectDirective extends BasicNode {
  type: 'directive';
  args: ['select', Expression, Expression];
}

export interface Directive extends BasicNode {
  type: 'directive';
  args: [string, ...Node[]];
}

// Columns, tables
export interface ColumnItems extends BasicNode {
  type: 'column-items';
  args: Expression[];
}

export interface Column extends BasicNode {
  type: 'column';
  args: [items: ColumnItems, indexName?: GenericIdentifier];
}

export interface TableColumn extends BasicNode {
  type: 'table-column';
  args: [name: ColDef, column: Expression];
}

/** @deprecated */
export interface TableSpread extends BasicNode {
  type: 'table-spread';
  args: [spreadTableRef: Ref];
}

export interface Table extends BasicNode {
  type: 'table';
  args: [TableDef, ...(TableColumn | TableSpread)[]];
}

export interface MatchDef extends BasicNode {
  type: 'matchdef';
  args: [Expression, Expression];
}

export interface Match extends BasicNode {
  type: 'match';
  args: MatchDef[];
}

export interface TieredDef extends BasicNode {
  type: 'tiered-def';
  args: [Expression, Expression];
}

export interface Tiered extends BasicNode {
  type: 'tiered';
  args: [Expression, ...TieredDef[]];
}

export interface PropertyAccess extends BasicNode {
  type: 'property-access';
  args: [Expression, ColRef];
}

export interface TableColumnAssign extends BasicNode {
  type: 'table-column-assign';
  args: [tableName: TablePartialDef, columnName: ColDef, value: Expression];
}

// Matrix stuff

export interface MatrixAssign extends BasicNode {
  type: 'matrix-assign';
  args: [def: Def, where: MatrixMatchers, assignee: Expression];
}

export interface MatrixRef extends BasicNode {
  type: 'matrix-ref';
  args: [ref: Ref, where: MatrixMatchers];
}

export interface MatrixMatchers extends BasicNode {
  type: 'matrix-matchers';
  args: Expression[];
}

// Sets

export interface Categories extends BasicNode {
  type: 'categories';
  args: [setName: CatDef, setContents: Expression];
}

// Generic stuff

export interface GenericIdentifier extends BasicNode {
  type: 'generic-identifier';
  args: [name: string];
}

export interface GenericList extends BasicNode {
  type: 'generic-list';
  args: Node[];
}

// Function calls and operators

export interface ArgList extends BasicNode {
  type: 'argument-list';
  args: Expression[];
}

export interface FunctionCall extends BasicNode {
  type: 'function-call';
  args: [FuncRef, ArgList];
}

// Definitions

export interface Assign extends BasicNode {
  type: 'assign';
  args: [def: Def, assignee: Expression];
}

export interface FunctionArgumentNames extends BasicNode {
  type: 'argument-names';
  args: Def[];
}

export interface FunctionDefinition extends BasicNode {
  type: 'function-definition';
  args: [name: FuncDef, arguments: FunctionArgumentNames, body: Block];
}

// Groupings

export interface Block extends BasicNode {
  type: 'block';
  id: string;
  args: Statement[];
}

export type GenericAssignment =
  | Assign
  | Table
  | MatrixAssign
  | FunctionDefinition
  | TableColumnAssign;

export type Expression =
  | Noop
  | FunctionCall
  | Ref
  | ExternalRef
  | PropertyAccess
  | Literal
  | Column
  | Range
  | Sequence
  | Date
  | Directive
  | AsDirective
  | OfDirective
  | OverDirective
  | SelectDirective
  | MatrixRef
  | Match
  | Tiered;

export type Statement =
  | FunctionDefinition
  | Assign
  | TableColumnAssign
  | Table
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
  | TableSpread
  | MatchDef
  | TieredDef;
