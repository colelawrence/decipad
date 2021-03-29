declare module '../src/grammar';

declare namespace Parser {
  interface UnparsedBlock {
    id: string;
    source: string;
  }

  interface ParsedBlock {
    id: string;
    solutions: Solution[];
  }

  type Solution = AST.Block;
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

  interface TableDef {
    type: 'tabledef';
    args: [tableName: string];
    start: Pos;
    end: Pos;
  }

  type Identifier = Ref | FuncRef | Def | FuncDef | ColDef | TableDef;

  // Literal number, char, string etc

  type LitArgs = ['number', number] | ['boolean', boolean] | ['string', string];

  interface Literal {
    type: 'literal';
    args: [...LitArgs, unit: Unit[] | null];
    type?: Type; // TODO
    start: Pos;
    end: Pos;
  }

  // Range expression
  interface Range {
    type: 'range';
    args: [start: Expression, end: Expression];
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

  interface TableColumns {
    type: 'table-columns';
    args: (ColDef | Expression)[];
    start: Pos;
    end: Pos;
  }

  interface TableDefinition {
    type: 'table-definition';
    args: [TableDef, TableColumns];
    start: Pos;
    end: Pos;
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

  type Expression = FunctionCall | Ref | Literal | Column | Range;
  type Statement = FunctionDefinition | Assign | TableDefinition | Expression;

  type Lists = FunctionArgumentNames | ArgList | TableColumns;

  type Node = Block | Statement | Identifier | Lists;

  interface TypeToNode {
    def: Def;
    ref: Ref;
    funcref: FuncRef;
    funcdef: FuncDef;
    coldef: ColDef;
    tabledef: TableDef;
    literal: Literal;
    'argument-list': ArgList;
    'function-call': FunctionCall;
    range: Range;
    column: Column;
    'table-columns': TableColumns;
    'table-definition': TableDefinition;
    assign: Assign;
    'argument-names': FunctionArgumentNames;
    'function-definition': FunctionDefinition;
    block: Block;
  }
}

declare namespace Interpreter {
  type ResultScalar = number | boolean;
  type ResultColumn = ResultScalar[];
  type ResultTable = Map<string, ResultColumn>;

  type OneResult = ResultScalar | ResultColumn | ResultTable;
  type Result = OneResult[];
}

type Type = import('../src/type').Type;
type TableType = import('../src/type').TableType;
interface Result {
  type: Type | TableType;
  value: Interpreter.Result;
}
