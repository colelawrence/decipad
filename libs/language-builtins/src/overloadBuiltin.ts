import uniqWith from 'lodash.uniqwith';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  Value,
  buildType,
  isDateType,
  isErrorType,
  isNumberType,
  type Type,
} from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import type { FullBuiltinSpec, Functor, Evaluator } from './interfaces';
import { dequal } from '@decipad/utils';

const selectMostSpecificErrorForTypes = (
  previousErrorType: Type | undefined,
  errorType: Type,
  argTypes: Type[]
): Type => {
  if (!previousErrorType) {
    return errorType;
  }
  const selectableErrorTypes = [previousErrorType, errorType];
  const errorsWithNonGenericErrorType = selectableErrorTypes.filter(
    (err) =>
      isErrorType(err) && err.errorCause.spec.errType !== 'expected-but-got'
  );
  if (errorsWithNonGenericErrorType.length === 1) {
    return errorsWithNonGenericErrorType[0];
  }
  if (argTypes.some(isDateType)) {
    return (
      selectableErrorTypes.find(
        (err) =>
          isErrorType(err) &&
          err.errorCause.spec.errType === 'mismatched-specificity'
      ) ?? errorType
    );
  }
  if (argTypes.some(isNumberType)) {
    return (
      selectableErrorTypes.find(
        (err) =>
          isErrorType(err) &&
          (err.errorCause.spec.errType === 'cannot-convert-between-units' ||
            err.errorCause.spec.errType === 'cannot-convert-to-unit' ||
            err.errorCause.spec.errType === 'expected-unit')
      ) ?? errorType
    );
  }
  return errorType;
};

const gatherOverloadCardinalities = (overloads: OverloadSpec[]): number[][] =>
  uniqWith(
    overloads
      .map((o) => o.argCardinalities)
      .filter(Boolean)
      .flat() as number[][],
    dequal
  );

export type OverloadSpec = FullBuiltinSpec;

export const overloadBuiltin = (
  fName: string,
  argCount: number | number[],
  overloads: OverloadSpec[],
  operatorKind?: 'prefix' | 'infix'
): FullBuiltinSpec => {
  const functorNoAutomap: Functor = async (types, values, context) => {
    let lastError: Type | undefined;
    for (const overload of overloads) {
      // eslint-disable-next-line no-await-in-loop
      const result = await context.callBuiltinFunctor(
        context,
        fName,
        types,
        values,
        overload
      );
      // the first to not have an errorCause is the one we want
      if (!isErrorType(result)) {
        return result;
      }
      lastError = selectMostSpecificErrorForTypes(lastError, result, types);
    }
    return selectMostSpecificErrorForTypes(
      lastError,
      buildType.impossible(InferError.badOverloadedBuiltinCall(fName, types)),
      types
    );
  };

  const fnValuesNoAutomap: Evaluator = async (
    values,
    argTypes,
    utils,
    valueNodes
  ) => {
    if (values.find(Value.isUnknownValue)) {
      return Value.UnknownValue;
    }
    let selectedOverload: FullBuiltinSpec | undefined;
    let returnType: Type | undefined;
    for (const overload of overloads) {
      // eslint-disable-next-line no-await-in-loop
      returnType = await utils.callBuiltinFunctor(
        utils,
        fName,
        argTypes,
        valueNodes,
        overload
      );
      if (!isErrorType(returnType)) {
        selectedOverload = overload;
        break;
      }
    }
    if (!selectedOverload || !returnType) {
      throw new Error(
        `panic: could not find overload for ${fName}(${getArgTypeKey(
          argTypes
        )})`
      );
    }

    return utils.callBuiltin(
      utils,
      fName,
      values,
      argTypes,
      returnType,
      valueNodes,
      selectedOverload
    );
  };

  return {
    argCount,
    fnValuesNoAutomap,
    functorNoAutomap,
    noAutoconvert: true,
    operatorKind,
    argCardinalities: gatherOverloadCardinalities(overloads),
  };
};

export const getOverloadedTypeFromValue = (
  val: ValueTypes.Value
): OverloadTypeName | null => {
  if (val instanceof Value.StringValue) {
    return 'string';
  } else if (val instanceof Value.BooleanValue) {
    return 'boolean';
  } else if (val instanceof Value.NumberValue) {
    return 'number';
  } else if (val instanceof Value.DateValue) {
    return 'date';
  } else if (val instanceof Range) {
    return 'range';
  } else {
    return null;
  }
};
export const getOverloadedTypeFromType = (t: Type): OverloadTypeName | null => {
  if (t.cellType != null) {
    return `column<${getOverloadedTypeFromType(t.cellType)}>`;
  } else if (t.rowCellTypes != null) {
    return `row`;
  } else if (t.type != null) {
    return t.type;
  } else if (t.date != null) {
    return 'date';
  } else if (t.rangeOf) {
    return 'range';
  } else {
    return null;
  }
};

export type OverloadTypeName = string;

// for string Maps
const argTypesKey = (types: (OverloadTypeName | null)[]) => types.join(';');

const getArgTypeKey = (types: Type[]): string =>
  argTypesKey(types.map(getOverloadedTypeFromType));
