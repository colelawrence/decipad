import type { Result, Value } from '@decipad/language-interfaces';
import { type LeanColumn } from './LeanColumn';

const isLeanColumn = (thing: Value.Value | undefined): thing is LeanColumn =>
  thing != null &&
  typeof thing === 'object' &&
  typeof (thing as LeanColumn).getGetData === 'function';

// move this somewhere else
export const getWasmId = async (
  thing: Value.Value | undefined
): Promise<string | undefined> => {
  if (!isLeanColumn(thing)) {
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
  if (!isLeanColumn(thing)) {
    return undefined;
  }

  const data = await thing.getGetData();
  if (typeof data !== 'function') {
    return undefined;
  }

  return data.WASM_REALM_ID;
};
