// eslint-disable-next-line no-restricted-imports
import { type Type } from '@decipad/language-types';
import { narrowFunctionCall } from './narrowing';
import { parseFunctionSignature } from './parseType';

export const parseFunctor = (signature: string) => {
  const { expectedArgs, returnType } = parseFunctionSignature(signature);
  return async (args: Type[]) =>
    narrowFunctionCall({ args, expectedArgs, returnType });
};
