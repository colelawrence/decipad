import {
  AST,
  buildType as t,
  Context,
  evaluateStatement,
  RuntimeError,
  serializeResult,
  validateResult,
  Value,
  Result,
  Type,
  buildType,
  inferBlock,
} from '@decipad/language';
import { getDefined, zip } from '@decipad/utils';
import { captureException } from '../reporting';
import { ComputerProgram, IdentifiedResult } from '../types';
import { getBlockFromProgram } from '../utils';
import { CacheContents, ComputationRealm } from '../computer/ComputationRealm';
import { getVisibleVariables } from '../computer/getVisibleVariables';
import { getExprRef, toUserlandResult } from '../exprRefs';
import { identifiedResultForTable } from './identifiedResultForTable';
import { Computer } from '../computer';

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
const internalComputeStatement = async (
  program: ComputerProgram,
  blockId: string,
  computer: Computer
): Promise<[IdentifiedResult, Value | undefined]> => {
  const realm = computer.computationRealm;
  const cachedResult = realm.getFromCache(blockId);
  let value: Value | undefined;

  const block = getBlockFromProgram(program, blockId);
  if (block && cachedResult) {
    if (block?.inferredType) {
      return [getDefined(cachedResult.result), cachedResult.value];
    } else {
      realm.evictStatement(program, blockId);
    }
  }

  const statement = block.args[0];

  realm.inferContext.statementId = getExprRef(blockId);
  const [_valueType, usedNames] = await inferWhileRetrievingNames(
    realm.inferContext,
    block
  );
  const valueType = _valueType;

  const getUsedNames = (): (readonly [string, string])[] | undefined =>
    usedNames?.map(
      (names): readonly [string, string] =>
        names.map(
          (name) => computer.latestExprRefToVarNameMap.get(name) ?? name
        ) as [string, string]
    );

  if (valueType.pending) {
    value = Result.UnknownValue;
  } else if (valueType.errorCause == null || valueType.functionness) {
    realm.interpreterRealm.statementId = getExprRef(blockId);
    try {
      value = await evaluateStatement(realm.interpreterRealm, statement);
    } catch (err) {
      // early return with error
      return [
        {
          type: 'computer-result',
          id: blockId,
          epoch: realm.epoch,
          result: serializeResult(
            buildType.impossible((err as Error).message),
            Result.Unknown
          ),
          visibleVariables: getVisibleVariables(
            program,
            blockId,
            realm.inferContext,
            computer.latestExprRefToVarNameMap
          ),
          usedNames: getUsedNames(),
        },
        undefined,
      ];
    }
  }

  const data = await value?.getData();
  if (data) {
    validateResult(valueType, data);
  }

  const variableName =
    statement.type === 'assign' || statement.type === 'table'
      ? statement.args[0].args[0]
      : undefined;

  const result: IdentifiedResult = {
    type: 'computer-result',
    id: blockId,
    epoch: realm.epoch,
    get result() {
      if (!valueType.errorCause && statement.type === 'table') {
        return identifiedResultForTable(realm, variableName, statement);
      }
      return serializeResult(valueType, data);
    },
    get visibleVariables() {
      return getVisibleVariables(
        program,
        blockId,
        realm.inferContext,
        computer.latestExprRefToVarNameMap
      );
    },
    usedNames: getUsedNames(),
  };
  return [result, value];
};

const computeStatement = async (
  program: ComputerProgram,
  blockId: string,
  computer: Computer
): Promise<[IdentifiedResult, Value | undefined]> => {
  const [resultWithAbstractRefs, value] = await internalComputeStatement(
    program,
    blockId,
    computer
  );
  const result = toUserlandResult(resultWithAbstractRefs, computer);
  return [result, value];
};

export const resultFromError = (
  error: Error,
  blockId: string,
  realm: ComputationRealm
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
    epoch: realm.epoch,
    result: serializeResult(t.impossible(message), null),
    usedNames: [],
  };
};

export const computeProgram = async (
  program: ComputerProgram,
  computer: Computer
): Promise<IdentifiedResult[]> => {
  const realm = computer.computationRealm;
  realm.inferContext.previousStatement = undefined;
  realm.interpreterRealm.previousStatementValue = undefined;

  // console.log('compute program', program.map(prettyPrintAST));

  let resultsToCache: CacheContents[] = [];
  for (const block of program.asSequence) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value] = await computeStatement(
        program,
        block.id,
        computer
      );

      realm.inferContext.previousStatement = result.result.type;
      realm.interpreterRealm.previousStatementValue = value;

      resultsToCache.push({ result, value });
    } catch (err) {
      console.error(err);
      resultsToCache.push({
        result: resultFromError(err as Error, block.id, realm),
      });
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

  for (const [block, result] of zip(program.asSequence, resultsToCache)) {
    realm.addToCache(block.id, result);
  }
  // same here:
  return resultsToCache.map((resultToCache) => resultToCache.result);
};

const inferWhileRetrievingNames = async (
  ctx: Context,
  block: AST.Block
): Promise<[Type, Context['usedNames']]> => {
  try {
    ctx.usedNames = [];
    const valueType = await inferBlock(block, ctx);
    const { usedNames } = ctx;
    return [valueType, usedNames];
  } finally {
    ctx.usedNames = undefined;
  }
};
