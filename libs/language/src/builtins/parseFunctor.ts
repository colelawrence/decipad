import { narrowFunctionCall, parseFunctionSignature, Type } from '../type';

export const parseFunctor = (signature: string) => {
  const { expectedArgs, returnType } = parseFunctionSignature(signature);
  return async (args: Type[]) =>
    narrowFunctionCall({ args, expectedArgs, returnType });
};
