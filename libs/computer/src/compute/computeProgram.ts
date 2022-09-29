import {
  AST,
  buildType as t,
  evaluateStatement,
  inferStatement,
  // prettyPrintAST,
  RuntimeError,
  serializeResult,
  validateResult,
  Value,
} from '@decipad/language';
import { getDefined, zip } from '@decipad/utils';
import { captureException } from '../reporting';
import { IdentifiedResult } from '../types';
import { getStatement } from '../utils';
import { CacheContents, ComputationRealm } from '../computer/ComputationRealm';
import { getVisibleVariables } from '../computer/getVisibleVariables';

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
const computeStatement = async (
  program: AST.Block[],
  blockId: string,
  realm: ComputationRealm
): Promise<[IdentifiedResult, Value | undefined]> => {
  const cachedResult = realm.getFromCache(blockId);
  let value: Value | undefined;

  if (cachedResult) {
    return [getDefined(cachedResult.result), cachedResult.value];
  }

  const statement = getStatement(program, blockId);
  const valueType = await inferStatement(
    realm.inferContext,
    statement,
    undefined
  );

  if (!(valueType.errorCause != null && !valueType.functionness)) {
    value = await evaluateStatement(realm.interpreterRealm, statement);
  }

  if (value) {
    validateResult(valueType, value.getData());
  }

  const variableName =
    statement.type === 'assign' ? statement.args[0].args[0] : undefined;

  const result: IdentifiedResult = {
    type: 'computer-result',
    id: blockId,
    variableName,
    get result() {
      if (statement.type === 'assign' && statement.args[1].type === 'table') {
        const type = getDefined(
          realm.inferContext.stack.get(getDefined(variableName))
        );
        const value = getDefined(
          realm.interpreterRealm.stack.get(getDefined(variableName))
        );
        return serializeResult(type, value?.getData());
      }
      return serializeResult(valueType, value?.getData());
    },
    visibleVariables: getVisibleVariables(program, blockId, realm.inferContext),
  };
  return [result, value];
};

export const resultFromError = (
  error: Error,
  blockId: string
): IdentifiedResult => {
  // Not a user-facing error, so let's hide internal details
  const message = error.message.replace(
    /^panic: (.+)$/,
    'Internal Error: $1. Please contact support'
  );

  if (!(error instanceof RuntimeError)) {
    captureException(error);
  }

  return {
    type: 'computer-result',
    id: blockId,
    result: serializeResult(t.impossible(message), null),
  };
};

export const computeProgram = async (
  program: AST.Block[],
  realm: ComputationRealm
): Promise<IdentifiedResult[]> => {
  realm.inferContext.previousStatement = undefined;
  realm.interpreterRealm.previousStatementValue = undefined;

  // console.log('compute program', program.map(prettyPrintAST));

  let resultsToCache: CacheContents[] = [];
  for (const block of program) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value] = await computeStatement(program, block.id, realm);

      realm.inferContext.previousStatement = result.result.type;
      realm.interpreterRealm.previousStatementValue = value;

      resultsToCache.push({ result, value });
    } catch (err) {
      resultsToCache.push({ result: resultFromError(err as Error, block.id) });
      realm.inferContext.previousStatement = undefined;
      realm.interpreterRealm.previousStatementValue = undefined;
    }
  }

  // copying the result triggers the getter from the identified result,
  // ... effectively freezing the type
  // We can only do this after computing the whole program.
  resultsToCache = resultsToCache.map((result) => ({
    result: { ...result.result },
    value: result.value,
  }));

  for (const [block, result] of zip(program, resultsToCache)) {
    realm.addToCache(block.id, result);
  }
  // same here:
  return resultsToCache.map((resultToCache) => resultToCache.result);
};
