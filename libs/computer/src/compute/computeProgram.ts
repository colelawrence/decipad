import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
import { Value as TValue } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type {
  TScopedInferContext,
  TScopedRealm,
  Type,
} from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import {
  buildType as t,
  RuntimeError,
  Value,
  evaluateStatement,
  inferBlock,
  isErrorType,
  isFunctionType,
} from '@decipad/language';
import { getDefined, zip } from '@decipad/utils';
import type {
  ComputerProgram,
  IdentifiedResult,
} from '@decipad/computer-interfaces';
import { captureException } from '../reporting';
import { getBlockFromProgram } from '../utils';
import type {
  CacheContents,
  ComputationRealm,
} from '../computer/ComputationRealm';
import { getVisibleVariables } from '../computer/getVisibleVariables';
import { getExprRef, toUserlandResult } from '../exprRefs';
import type { Computer } from '../computer';
import { massageComputeResult } from './massageComputeResult';
import { serializeComputeResult } from './serializeComputeResult';
import { TStackFrame } from '../../../language/src/scopedRealm/stack';
import { UnknownValue } from 'libs/language-types/src/Value';

/*
 - Skip cached stuff
 - Infer this statement
 - Evaluate the statement if it's not a type error
 */
// eslint-disable-next-line complexity
const internalComputeStatement = async (
  program: ComputerProgram,
  blockId: string,
  computer: Computer,
  interimValueStack: TStackFrame<TValue.Value>,
  interimTypeStack: TStackFrame<Type>
): Promise<[IdentifiedResult, ValueTypes.Value | undefined, Type]> => {
  const realm = computer.computationRealm;
  const cachedResult = realm.getFromCache(blockId);
  let value: ValueTypes.Value | undefined;

  const block = getBlockFromProgram(program, blockId);
  if (block && cachedResult) {
    if (block?.inferredType) {
      return [
        getDefined(cachedResult.result),
        cachedResult.value,
        block?.inferredType,
      ];
    }
  }

  try {
    const statement = block.args[0];

    realm.interpreterRealm.statementId = getExprRef(blockId);
    const [valueType, usedNames] = await inferWhileRetrievingNames(
      realm.interpreterRealm,
      block
    );

    const getUsedNames = (): (readonly [string, string])[] | undefined =>
      usedNames?.map(
        (names): readonly [string, string] =>
          names.map(
            (name) => computer.latestExprRefToVarNameMap.get(name) ?? name
          ) as [string, string]
      );

    if (valueType.pending) {
      value = Value.UnknownValue;
    } else if (!isErrorType(valueType) || isFunctionType(valueType)) {
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
            result: serializeComputeResult(
              t.impossible((err as Error).message),
              Value.UnknownValue,
              undefined
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
          valueType,
        ];
      }
    } else {
      value = Value.UnknownValue;
    }

    const data = await value?.getData();

    const variableName =
      statement.type === 'assign' || statement.type === 'table'
        ? statement.args[0].args[0]
        : undefined;

    const result: IdentifiedResult = {
      type: 'computer-result',
      id: blockId,
      epoch: realm.epoch,
      get result() {
        return serializeComputeResult(
          ...massageComputeResult(
            realm,
            interimValueStack,
            interimTypeStack,
            valueType,
            variableName,
            statement,
            value ?? UnknownValue,
            data
          )
        );
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

    return [result, value, valueType];
  } finally {
    computer.computing.next([blockId, false]);
  }
};

const computeStatement = async (
  program: ComputerProgram,
  blockId: string,
  computer: Computer,
  interimValueStack: TStackFrame<TValue.Value>,
  interimTypeStack: TStackFrame<Type>
): Promise<[IdentifiedResult, ValueTypes.Value | undefined, Type]> => {
  const [resultWithAbstractRefs, value, type] = await internalComputeStatement(
    program,
    blockId,
    computer,
    interimValueStack,
    interimTypeStack
  );
  const result = toUserlandResult(resultWithAbstractRefs, computer);
  return [result, value, type];
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
    console.error('Computer: Runtime error caught:', error);
    captureException(error);
  }

  return {
    type: 'computer-result',
    id: blockId,
    epoch: realm.epoch,
    result: serializeComputeResult(
      t.impossible(message),
      UnknownValue,
      undefined
    ),
    usedNames: [],
  };
};

function resultsToCacheMap(result: CacheContents): CacheContents {
  return {
    result: { ...result.result },
    value: result.value,
  };
}

function cacheContentsToResult(cacheContents: CacheContents): IdentifiedResult {
  return cacheContents.result;
}

export const computeProgram = async (
  program: ComputerProgram,
  computer: Computer
): Promise<IdentifiedResult[]> => {
  const realm = computer.computationRealm;

  const interimValueStack = realm.interpreterRealm.stack.push();
  const interimTypeStack = realm.inferContext.stack.push();

  let resultsToCache: CacheContents[] = [];
  for (const block of program.asSequence) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const [result, value, type] = await computeStatement(
        program,
        block.id,
        computer,
        interimValueStack,
        interimTypeStack
      );

      resultsToCache.push({ result, value });

      if (block.definesVariable) {
        interimValueStack.set(block.definesVariable, value);
        interimTypeStack.set(block.definesVariable, type);
      }
    } catch (err) {
      console.error('computeProgram: caught error', err);
      resultsToCache.push({
        result: resultFromError(err as Error, block.id, realm),
      });
    }
  }

  // copying the result triggers the getter from the identified result,
  // ... effectively freezing the type
  // We can only do this after computing the whole program.
  resultsToCache = resultsToCache.map(resultsToCacheMap);

  for (const [block, result] of zip(program.asSequence, resultsToCache)) {
    realm.addToCache(block.id, result);
  }
  // same here:
  return resultsToCache.map(cacheContentsToResult);
};

const inferWhileRetrievingNames = async (
  realm: TScopedRealm,
  block: AST.Block
): Promise<[Type, TScopedInferContext['usedNames']]> => {
  const { inferContext: ctx } = realm;
  try {
    ctx.usedNames = [];

    const valueType = await inferBlock(block, realm);
    const { usedNames } = ctx;
    return [valueType, usedNames];
  } finally {
    ctx.usedNames = [];
  }
};
