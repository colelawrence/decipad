import { getOnly, produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  InferError,
  Type,
  serializeType,
  buildType as t,
  isPendingType,
} from '@decipad/language-types';
import type { AST } from '@decipad/language-interfaces';
import { getOperatorByName } from './operators';
import type {
  FullBuiltinSpec,
  Functor,
  BuiltinContextUtils,
  CallBuiltinFunctor,
} from './types';
import { parseFunctor } from './parseFunctor';

const internalCallBuiltinFunctor = async (
  context: BuiltinContextUtils,
  opName: string,
  givenArguments: Type[],
  givenValues: AST.Expression[],
  op: FullBuiltinSpec | undefined = getOperatorByName(opName) ?? undefined
): Promise<Promise<Type> | Type> => {
  const error = givenArguments.find(typeHasError);
  if (error) {
    return error;
  }

  if (op == null) {
    return t.impossible(InferError.missingFormula(opName));
  }
  let { argCount: argCounts = [] } = op;
  if (typeof argCounts === 'number') {
    argCounts = [argCounts];
  }
  if (argCounts.indexOf(givenArguments.length) < 0) {
    return t.impossible(
      `The function ${opName} requires ${op.argCount} parameters and ${givenArguments.length} parameters were entered`
    );
  }

  // any pending argument yields a pending type (contagious)
  const pending = givenArguments.find(isPendingType);
  if (pending) {
    return pending;
  }

  if (op.functorNoAutomap != null) {
    return op.functorNoAutomap(givenArguments, givenValues, context);
  }

  if (op.isReducer) {
    const lowerDimFunctor = getFunctor(op);
    const onlyArg = getOnly(
      givenArguments,
      'panic: isReducer used in a function with multiple arguments'
    );
    return Dimension.automapTypesForReducer(onlyArg, async (types: Type[]) =>
      lowerDimFunctor(types, givenValues, context)
    );
  }

  const resultTypes = await Dimension.automapTypes(
    context,
    givenArguments,
    async ([type, ...rest]) =>
      (
        await Type.combine(type, ...rest)
      ).mapType(async () =>
        getFunctor(op)([type, ...rest], givenValues, context)
      ),
    op.argCardinalities
  );

  return resultTypes;
};

const formatTypes = (types: Type[]): string =>
  types.map((t) => serializeType(t).kind).join(', ');

const enrichErrorType = (
  opName: string,
  argumentTypes: Type[],
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

export const callBuiltinFunctor: CallBuiltinFunctor = async (
  ctx,
  funcName,
  argTypes,
  params,
  op
): Promise<Type> => {
  const returnType = await internalCallBuiltinFunctor(
    ctx,
    funcName,
    argTypes,
    params,
    op
  );
  if (typeHasError(returnType)) {
    return enrichErrorType(funcName, argTypes, returnType);
  }
  return returnType;
};

function typeHasError(t: Type) {
  return t.errorCause != null;
}

const getFunctor = (op: FullBuiltinSpec): Functor => {
  if (op.functor) {
    return op.functor;
  }

  if (op.functionSignature) {
    return parseFunctor(op.functionSignature);
  }

  throw new Error(`must either specify a functor or a functionSignature`);
};
