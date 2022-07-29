import { narrowFunctionCall, parseFunctionSignature, Type } from '../type';

export const parseFunctor = (signature: string) => {
  const { expectedArgs, returnType } = parseFunctionSignature(signature);
  return (args: Type[]) =>
    narrowFunctionCall({ args, expectedArgs, returnType });
};
