import type { Result, Value } from '@decipad/language-interfaces';
import { LeanColumn } from '.';

// move this somewhere else
export const getWasmId = async (
  thing: Value.Value | undefined
): Promise<string | undefined> => {
  if (!(thing instanceof LeanColumn)) {
    return undefined;
  }

  const data = await thing.getGetData();
  if (typeof data !== 'function') {
    return undefined;
  }

  return data.WASM_ID;
};

export const getWasmRealmId = async (
  thing: Value.Value | undefined
): Promise<Result.ResultGenerator['WASM_REALM_ID'] | undefined> => {
  if (!(thing instanceof LeanColumn)) {
    return undefined;
  }

  const data = await thing.getGetData();
  if (typeof data !== 'function') {
    return undefined;
  }

  return data.WASM_REALM_ID;
};
