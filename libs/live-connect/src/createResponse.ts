import { Result } from '@decipad/computer';
import { RPCResponse } from './types';

export const createResponse = (result: Result.Result): Result.Result => {
  return result; // TODO: un-serialize JSON-unfriendly structs (like Fraction and bigints)
};

export const createRPCResponse = (result: Result.Result): RPCResponse => {
  return result; // TODO: serialize JSON-unfriendly structs (like Fraction and bigints)
};
