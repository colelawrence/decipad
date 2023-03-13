/* istanbul ignore file: just config and re-export */
import { operators } from './builtins';
import type { Result } from './result';
import { build as t, SerializedType, serializeType, Unit } from './type';

export { parseUTCDate, stringifyDate, Time, getDateFromAstForm } from './date';
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
  makeContext,
} from './infer';
export type { Context } from './infer';
export type { ColumnLike, Value } from './value';
export { isColumnLike, CompareValues, getColumnLike } from './value';
export {
  evaluateStatement,
  Realm,
  runBlock,
  RuntimeError,
} from './interpreter';
export type { Interpreter } from './interpreter';
export { Column, DateValue, fromJS, Range, Row, Scalar, Table } from './value';
export type { SliceRange, SlicesMap } from './value';
export {
  AST,
  parse,
  decilang,
  parseBlock,
  parseStatement,
  parseExpression,
  Parser,
  SyntaxError,
} from './parser';
export { prettyPrintAST } from './parser/utils';
export * from './langPluralize';
export { previousRefSymbols } from './previous-ref';
export { serializeResult, validateResult } from './result';
export * as Result from './result';
export * from './run';
export {
  build as buildType,
  convertToMultiplierUnit,
  deserializeType,
  InferError,
  inverseExponent,
  normalizeUnits,
  pluralizeUnit,
  serializeType,
  simplifyUnits,
  Type,
} from './type';
export type {
  ErrSpec,
  SerializedType,
  SerializedTypeKind,
  SerializedTypes,
} from './type';
export * from './units';
export {
  DEFAULT_PRECISION,
  isAssignment,
  isExpression,
  isIdentifier,
  MAX_PRECISION,
  n as astNode,
  safeNumberForPrecision,
  walkAst,
  mutateAst,
  isStatement,
} from './utils';
export { linearizeType } from './dimtools/common';
export type { Unit };
export * from './simpleValues';

export type ExternalDataMap = Map<string, Result>;

export interface AutocompleteName {
  syntax?: string;
  example?: string;
  formulaGroup?: string;
  kind: 'function' | 'variable' | 'column';
  type: SerializedType;
  name: string;
  explanation?: string;
  blockId?: string;
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
