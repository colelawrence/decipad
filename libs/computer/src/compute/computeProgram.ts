import {
  AST,
  buildType as t,
  evaluateStatement,
  inferStatement,
  RuntimeError,
  serializeResult,
  validateResult,
  Value,
} from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { captureException } from '../reporting';
import { IdentifiedResult } from '../types';
import { getAllBlockIds, getStatement } from '../utils';
import { ComputationRealm } from '../computer/ComputationRealm';
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

  const result: IdentifiedResult = {
    type: 'computer-result',
    id: blockId,
    variableName:
      statement.type === 'assign' ? statement.args[0].args[0] : undefined,
    result: serializeResult(valueType, value?.getData()),
    visibleVariables: getVisibleVariables(program, blockId, realm.inferContext),
  };
  realm.addToCache(blockId, { result, value });
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

  const results: IdentifiedResult[] = [];
  for (const location of getAllBlockIds(program)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value] = await computeStatement(program, location, realm);
      realm.inferContext.previousStatement = result.result.type;
      realm.interpreterRealm.previousStatementValue = value;

      results.push(result);
    } catch (err) {
      results.push(resultFromError(err as Error, location));
      realm.inferContext.previousStatement = undefined;
      realm.interpreterRealm.previousStatementValue = undefined;
    }
  }

  return results;
};
