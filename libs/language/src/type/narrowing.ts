import { getDefined, zip } from '@decipad/utils';
import produce from 'immer';
import {
  build as t,
  deserializeType,
  SerializedTypes,
  serializeType,
  Type,
} from '.';
import { equalOrUndefined, equalOrUnknown } from '../utils';
import { InferError } from './InferError';
import { onlyOneIsPercentage } from './percentages';
import { traverseType } from './traverseType';
import { matchUnitArrays } from './units';

export interface FunctionSignature {
  expectedArgs: Type[];
  returnType: Type;
}

export function narrowTypes(
  t1: Type,
  t2: Type,
  mutSymbols = new Map<string, Type>(),
  errorPath: ('column' | 'range')[] = []
): Type {
  if (t1.errorCause) return t1;
  if (t2.errorCause) return t2;

  // Treat generic symbols
  if (t1.symbol) {
    if (mutSymbols.has(t1.symbol)) {
      t1 = getDefined(mutSymbols.get(t1.symbol));
    } else {
      mutSymbols.set(t1.symbol, t2);
    }
  }

  const s1 = serializeType(t1);
  const s2UnknownType = serializeType(t2);

  if (s1.kind === 'anything') return t2;
  if (s2UnknownType.kind === 'anything') return t1;

  const ret = (() => {
    if (s1.kind !== s2UnknownType.kind) {
      return t2.expected(s1.kind);
    }

    switch (s1.kind) {
      case 'nothing':
      case 'boolean':
      case 'type-error':
      case 'string': {
        return t1;
      }

      case 'number': {
        if (onlyOneIsPercentage(t1.numberFormat, t2.numberFormat)) {
          return produce(t1, (number) => {
            number.numberFormat = null;
          });
        }
        return narrowUnitsOf(t1, t2);
      }

      case 'date': {
        const s2 = s2UnknownType as SerializedTypes.Date;

        if (s1.date !== s2.date) {
          return t2.expected(s1.date);
        }

        return t1;
      }

      case 'range': {
        const narrowedContents = narrowTypes(
          getDefined(t1.rangeOf),
          getDefined(t2.rangeOf),
          mutSymbols,
          [...errorPath, 'range']
        );

        if (narrowedContents.errorCause) {
          return narrowedContents;
        }

        return produce(t1, (type) => {
          type.rangeOf = narrowedContents;
        });
      }

      case 'column': {
        const s2 = s2UnknownType as SerializedTypes.Column;

        const narrowedCell = narrowTypes(
          getDefined(t1.cellType),
          getDefined(t2.cellType),
          mutSymbols,
          [...errorPath, 'column']
        );

        if (narrowedCell.errorCause) {
          return narrowedCell;
        }

        if (!equalOrUnknown(s1.columnSize, s2.columnSize)) {
          return t1.withErrorCause('mismatched column size');
        }

        if (!equalOrUndefined(s1.indexedBy, s2.indexedBy)) {
          return t1.withErrorCause('mismatched index name');
        }

        return produce(t1, (type) => {
          type.columnSize =
            s1.columnSize === 'unknown' ? s2.columnSize : s1.columnSize;
          type.cellType = narrowedCell;
        });
      }

      case 'table': {
        throw new Error('tables cannot be narrowed');
      }

      case 'row': {
        throw new Error('rows cannot be narrowed');
      }

      case 'function': {
        throw new Error('functions cannot be narrowed');
      }
    }
  })();

  // Trace the path to the error
  return produce(ret, (type) => {
    if (type.errorCause && !type.errorCause.pathToError.length) {
      type.errorCause.pathToError = errorPath;
    }
  });
}

interface NarrowFunctionCallArgs {
  args: Type[];
  expectedArgs: Type[];
  returnType: Type;
}

function narrowUnitsOf(t1: Type, t2: Type): Type {
  const s1 = t1.unit;
  const s2 = t2.unit;

  if (s1 == null || s2 == null) {
    // Either unit wins, if any
    return produce(t1, (number) => {
      number.unit = s1 || s2;
    });
  }

  if (matchUnitArrays(s1, s2)) {
    // Must be the same unit
    return t1;
  }

  return t.impossible(InferError.expectedUnit(s1, s2));
}

export function narrowFunctionCall({
  args,
  expectedArgs,
  returnType,
}: NarrowFunctionCallArgs): Type {
  const genericSymbols = new Map<string, Type>();

  const actualArgs = zip(args, expectedArgs).map(([arg, expected]) =>
    narrowTypes(expected, arg, genericSymbols)
  );

  const error = actualArgs.find((t) => t.errorCause);

  if (error) {
    return error;
  }

  const returnTypeWithSymbols = traverseType(
    serializeType(returnType),
    (type) => {
      if (type.symbol) {
        const ret = getDefined(genericSymbols.get(type.symbol));
        const typeWithoutSymbol = produce(ret, (t) => {
          t.symbol = null;
        });
        return serializeType(typeWithoutSymbol);
      }
      return type;
    }
  );

  return deserializeType(returnTypeWithSymbols);
}
