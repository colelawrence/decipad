import type {
  ColumnDesc,
  ComputeDeltaRequest,
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  ProgramBlock,
} from '@decipad/computer-interfaces';
import type {
  AST,
  AutocompleteName,
  Parser,
  SerializedType,
  Unit,
} from '@decipad/language-interfaces';

export type SerializedResult = {
  type: ArrayBuffer;
  value: ArrayBuffer;
};
export type SerializedIdentifiedResult = Omit<IdentifiedResult, 'result'> & {
  result: SerializedResult;
};

export type SerializedToken = Omit<moo.Token, 'toString'>;

export type SerializedParserError = Omit<Parser.ParserError, 'token'> & {
  token?: SerializedToken;
};

export type SerializedIdentifiedError = Omit<IdentifiedError, 'error'> & {
  error?: SerializedParserError | undefined;
};

export type SerializedBlockResult =
  | SerializedIdentifiedError
  | SerializedIdentifiedResult;

export type SerializedProgramBlock = ProgramBlock; // IdentifiedBlock.block contains a dehydrated AST

export type SerializedComputeDeltaRequest = Omit<
  ComputeDeltaRequest,
  'external' | 'program' | 'extra'
> & {
  external?: Omit<ComputeDeltaRequest['external'], 'upsert'> & {
    upsert?: Map<string, ArrayBuffer>;
  };
  program?: Omit<ComputeDeltaRequest['program'], 'upsert'> & {
    // eslint-disable-next-line no-use-before-define
    upsert?: SerializedProgramBlock[];
  };
  extra?: Omit<ComputeDeltaRequest['extra'], 'upsert'> & {
    upsert?: Map<string, SerializedProgramBlock[]>;
  };
};

export type SerializedNotebookResults = Omit<
  NotebookResults,
  'blockResults'
> & {
  blockResults: {
    readonly [blockId: string]: SerializedBlockResult;
  };
};

export type SerializedColumnDesc = Omit<ColumnDesc, 'result' | 'blockType'> & {
  result: SerializedResult;
  blockType: ArrayBuffer;
};

export type SerializedColumnDescArray = SerializedColumnDesc[];

export type SerializedAutocompleteName = Omit<AutocompleteName, 'type'> & {
  type: ArrayBuffer;
};

export type SerializedAutocompleteNames = SerializedAutocompleteName[];

export type SerializedASTExpression = AST.Expression; // AST.Expression contains a dehydrated AST

export type SerializedUnit = Omit<Unit, 'exp' | 'multiplier' | 'aliasFor'> & {
  exp: ArrayBuffer;
  multiplier: ArrayBuffer;
  aliasFor?: SerializedUnit[];
};

export type SerializedSerializedType = Omit<SerializedType, 'unit'> & {
  unit?: SerializedUnit[] | null;
};
