import { getOnly } from '@decipad/utils';
import produce from 'immer';
import type { AST, Context } from '..';
import { Type, buildType as t, InferError } from '../type';
import { automapTypes, automapTypesForReducer } from '../dimtools';
import { getOperatorByName } from './operators';
import { serializeType } from '../type/serialization';
import { BuiltinSpec, Functor } from './interfaces';
import { parseFunctor } from './parseFunctor';

type CallBuiltinFunctorParams =
  | [Context, string, Type[]]
  | [Context, string, Type[], AST.Expression[]];

const internalCallBuiltinFunctor = (
  context: Context,
  opName: string,
  givenArguments: Type[],
  givenValues?: AST.Expression[]
): Type => {
  const error = givenArguments.find(typeHasError);
  if (error) {
    return error;
  }

  const op = getOperatorByName(opName);

  if (op == null) {
    return t.impossible(InferError.missingFormula(opName));
  } else {
    let { argCount: argCounts = [] } = op;
    if (typeof argCounts === 'number') {
      argCounts = [argCounts];
    }
    if (argCounts.indexOf(givenArguments.length) < 0) {
      return t.impossible(
        `The function ${opName} requires ${op.argCount} parameters and ${givenArguments.length} parameters were entered`
      );
    }

    if (op.isReducer) {
      const lowerDimFunctor = getFunctor(op);
      const onlyArg = getOnly(
        givenArguments,
        'panic: isReducer used in a function with multiple arguments'
      );
      return automapTypesForReducer(onlyArg, (types: Type[]) =>
        lowerDimFunctor(types, givenValues, context)
      );
    }

    if (op.functorNoAutomap != null) {
      return op.functorNoAutomap(givenArguments, givenValues, context);
    }

    return automapTypes(
      givenArguments,
      ([type, ...rest]) =>
        Type.combine(type, ...rest).mapType(() =>
          getFunctor(op)([type, ...rest], givenValues, context)
        ),
      op.argCardinalities
    );
  }
};

const formatTypes = (types: Type[]): string =>
  types.map((t) => serializeType(t).kind).join(', ');

const enrichErrorType = (
  [, opName, argumentTypes]: CallBuiltinFunctorParams,
  type: Type
): Type => {
  if (!type.errorCause) {
    return type;
  }
  const { spec } = type.errorCause;
  if (!spec) {
    return type;
  }
  if (!type.errorCause.spec.context) {
    return produce(type, (type) => {
      type.errorCause = produce(type.errorCause, (errorCause: InferError) => {
        errorCause.spec = produce(errorCause.spec, (spec) => {
          spec.context = `in operation "${opName}" (${formatTypes(
            argumentTypes
          )})`;
        });
      });
    });
  }
  return type;
};

export const callBuiltinFunctor = (
  ...params: CallBuiltinFunctorParams
): Type => {
  const returnType = internalCallBuiltinFunctor(
    ...(params as [Context, string, Type[], AST.Expression[] | undefined])
  );
  if (typeHasError(returnType)) {
    return enrichErrorType(params, returnType);
  }
  return returnType;
};

function typeHasError(t: Type) {
  return t.errorCause != null;
}

const getFunctor = (op: BuiltinSpec): Functor => {
  if (op.functor) {
    return op.functor;
  }

  if (op.functionSignature) {
    return parseFunctor(op.functionSignature);
  }

  throw new Error(`must either specify a functor or a functionSignature`);
};
