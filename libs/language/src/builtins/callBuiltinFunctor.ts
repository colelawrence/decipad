import { Type, build as t } from '../type';
import { automapTypes, automapTypesForReducer } from '../dimtools';
import { getDefined } from '../utils';
import { getOperatorByName } from './operators';
import { AST } from '../parser';

function typeHasError(t: Type) {
  return t.errorCause != null;
}

export const callBuiltinFunctor = (
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
    return t.impossible(`The operator ${opName} does not exist`);
  } else {
    if (op.aliasFor) {
      return callBuiltinFunctor(op.aliasFor, givenArguments, givenValues);
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

    if (op.isReducer) {
      return automapTypesForReducer(givenArguments[0], getDefined(op.functor));
    }

    if (op.functorNoAutomap != null) {
      return op.functorNoAutomap(givenArguments, givenValues);
    }

    return automapTypes(
      givenArguments,
      ([type, ...rest]) =>
        Type.combine(type, ...rest).mapType(() =>
          getDefined(op.functor, 'need a builtin functor')(
            [type, ...rest],
            givenValues
          )
        ),
      op.argCardinalities
    );
  }
};
