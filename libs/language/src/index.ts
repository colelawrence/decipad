/* istanbul ignore file: just config and re-export */

// eslint-disable-next-line no-restricted-imports
import { operators } from '@decipad/language-builtins';
import type { AutocompleteName } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { serializeType, buildType as t } from '@decipad/language-types';

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
  getOfType,
  SyntaxError,
} from './parser';
export { prettyPrintAST } from './parser/utils';
export * from './run';
// eslint-disable-next-line no-restricted-imports
export {
  isAssignment,
  isExpression,
  isIdentifier,
  n as astNode,
  walkAst,
  walkAstAsync,
  mutateAst,
  isStatement,
} from '@decipad/language-utils';
export { materializeResult } from './utils/materializeResult';
export * from './simpleValues';

let cachedBuiltins: AutocompleteName[] | null = null;
/* Always returns the same array. It's a function, so as to avoid an import cycle */
export const getBuiltinsForAutocomplete = (): AutocompleteName[] => {
  if (!cachedBuiltins) {
    cachedBuiltins = Object.entries(operators).flatMap(([name, operator]) => {
      if (operator.operatorKind || operator.hidden) {
        return [];
      }
      return {
        autocompleteGroup: 'function',
        kind: serializeType(t.functionPlaceholder(name, undefined)).kind,
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
  type BuiltinSpec,
  type FullBuiltinSpec,
} from '@decipad/language-builtins';
export type { FormulaGroup } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
export * from '@decipad/language-types';

export { operators };
