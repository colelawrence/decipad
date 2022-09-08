import { ImportResult } from '@decipad/import';
import { RPCResponse } from './types';

export const createResponse = (result: ImportResult): ImportResult => {
  return result; // TODO: un-serialize JSON-unfriendly structs (like Fraction and bigints)
};

export const createRPCResponse = (result: ImportResult): RPCResponse => {
  return result; // TODO: serialize JSON-unfriendly structs (like Fraction and bigints)
};
