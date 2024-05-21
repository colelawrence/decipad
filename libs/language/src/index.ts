/* istanbul ignore file: just config and re-export */

// eslint-disable-next-line no-restricted-imports
import { operators } from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
import {
  serializeType,
  type Result,
  type SerializedType,
  buildType as t,
} from '@decipad/language-types';

export { Time, getDateFromAstForm } from './date';
export {
  identifierRegExpGlobal,
  STATEMENT_SEP_TOKEN_TYPE,
  tokenize,
  tokenRules,
} from './grammar';
export type { Token } from './grammar';
export * from './grammar/containmentCounting';
export {
  inferBlock,
  inferExpression,
  inferProgram,
  inferStatement,
  initialInferStats,
} from './infer';
export { tableValueToTableResultValue } from './value';
export {
  evaluateStatement,
  runBlock,
  initialInterpreterStats,
  functionCallValue,
} from './interpreter';
export * from './scopedRealm';
export type { InterpreterStats } from './interpreter';
export {
  parse,
  decilang,
  parseBlock,
  parseStatement,
  parseExpression,
  Parser,
  getOfType,
  SyntaxError,
} from './parser';
export { prettyPrintAST } from './parser/utils';
export { serializeResult } from './result';
export { validateResult } from './validateResult';
export * from './run';
export {
  isAssignment,
  isExpression,
  isIdentifier,
  n as astNode,
  walkAst,
  walkAstAsync,
  mutateAst,
  isStatement,
} from './utils';
export { buildResult } from './utils/buildResult';
export { materializeResult } from './utils/materializeResult';
export * from './simpleValues';

export type ExternalDataMap = ReadonlyMap<string, Result.Result>;

export interface AutocompleteName {
  kind: 'function' | 'variable' | 'column';
  syntax?: string;
  example?: string;
  formulaGroup?: string;
  type: SerializedType;
  name: string;
  inTable?: string;
  explanation?: string;
  blockId?: string;
  columnId?: string;
  isLocal?: boolean;
}

let cachedBuiltins: AutocompleteName[] | null = null;
/* Always returns the same array. It's a function, so as to avoid an import cycle */
export const getBuiltinsForAutocomplete = (): AutocompleteName[] => {
  if (!cachedBuiltins) {
    cachedBuiltins = Object.entries(operators).flatMap(([name, operator]) => {
      if (operator.operatorKind || operator.hidden) {
        return [];
      }
      return {
        kind: 'function',
        type: serializeType(t.functionPlaceholder(name, undefined)),
        name,
        blockId: undefined,
        explanation: operator.explanation,
        example: operator.example,
        syntax: operator.syntax,
        formulaGroup: operator.formulaGroup,
      };
    });
  }

  return cachedBuiltins;
};

// eslint-disable-next-line no-restricted-imports
export {
  getConstantByName,
  type Constant,
  type BuiltinSpec,
  type FullBuiltinSpec,
} from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
export * from '@decipad/language-types';

export { operators };
