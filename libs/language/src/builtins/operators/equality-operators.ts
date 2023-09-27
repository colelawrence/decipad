import { compare } from '../../compare';
import { Type, narrowFunctionCall, buildType as t } from '../../type';
import { BuiltinSpec } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (a: any, b: any) => {
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b;
  }
  return compare(a, b) === 0;
};

const equalityFunctor: BuiltinSpec['functor'] = async ([a, b]) => {
  const isUnknown = await Type.either(
    (await a.isNothing()).mapType(() => t.boolean()),
    (await b.isNothing()).mapType(() => t.boolean())
  );
  if (!isUnknown.errorCause) {
    return isUnknown;
  }
  return narrowFunctionCall({
    args: [a, b],
    expectedArgs: [t.symbol('A'), t.symbol('A')],
    returnType: t.boolean(),
  });
};

export const equalityOperators: Record<string, BuiltinSpec> = {
  '==': {
    argCount: 2,
    fn: ([a, b]) => isEqual(a, b),
    functor: equalityFunctor,
    operatorKind: 'infix',
    likesUnknowns: true,
  },
  '!=': {
    argCount: 2,
    fn: ([a, b]) => !isEqual(a, b),
    functor: equalityFunctor,
    operatorKind: 'infix',
    likesUnknowns: true,
  },
};
