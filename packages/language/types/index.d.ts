declare module "../src/grammar";

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
    type: "def";
    args: [varName: string];
    start: Pos;
    end: Pos;
  }

  interface Ref {
    type: "ref";
    args: [varName: string];
    start: Pos;
    end: Pos;
  }

  interface FuncRef {
    type: "funcref";
    args: [functionName: string];
    start: Pos;
    end: Pos;
  }

  interface FuncDef {
    type: "funcdef";
    args: [functionName: string];
    start: Pos;
    end: Pos;
  }

  type Identifier = Ref | FuncRef | Def | FuncDef;

  // Literal number, char, string etc

  type LitArgs =
    | ["number", number]
    | ["boolean", boolean]
    | ["string", string]

  interface Literal {
    type: "literal";
    args: [
      ...LitArgs,
      unit: Unit[] | null
    ];
    start: Pos;
    end: Pos;
  }

  // Columns, tables
  interface Column {
    type: "column";
    args: [
      contents: Expression[]
    ];
    start: Pos;
    end: Pos;
  }

  // Function calls and operators

  interface ArgList {
    type: "argument-list";
    args: Expression[];
    start: Pos;
    end: Pos;
  }

  interface FunctionCall {
    type: "function-call";
    args: [FuncRef, ArgList];
    start: Pos;
    end: Pos;
  }

  // Conditions

  interface Conditional {
    type: "conditional";
    args: [condition: Expression, then: Expression, otherwise: Expression];
    start: Pos;
    end: Pos;
  }

  // Definitions

  interface Assign {
    type: "assign";
    args: [def: Def, assignee: Expression];
    start: Pos;
    end: Pos;
  }

  interface FunctionArgumentNames {
    type: "argument-names";
    args: Def[];
    start: Pos;
    end: Pos;
  }

  interface FunctionDefinition {
    type: "function-definition";
    args: [name: FuncDef, arguments: FunctionArgumentNames, body: Block];
    start: Pos;
    end: Pos;
  }

  // Groupings

  interface Block {
    type: "block";
    id: string;
    args: Statement[];
    start: Pos;
    end: Pos;
  }

  type Expression = FunctionCall | Ref | Literal | Conditional | Column;
  type Statement = FunctionDefinition | Assign | Expression;

  type Lists = FunctionArgumentNames | ArgList;

  type Node = Block | Statement | Identifier | Lists;

  interface TypeToNode {
    def: Def;
    ref: Ref;
    funcref: FuncRef;
    funcdef: FuncDef;
    literal: Literal;
    "argument-list": ArgList;
    "function-call": FunctionCall;
    column: Column;
    conditional: Conditional;
    assign: Assign;
    "argument-names": FunctionArgumentNames;
    "function-definition": FunctionDefinition;
    block: Block;
  }
}

type Type = import('../src/type').Type
interface Result {
  type: Type,
  value: number[]
}
