/* eslint-disable camelcase */
/* eslint-disable import/no-relative-packages */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-relative-packages, camelcase
import {
  ComputeBackend,
  console_hook,
  DateSpecificity,
  DeciType,
  Kind,
} from './wasm/compute_backend';
import { serializeResult, deserializeResult } from './serializableResult';
import { Specificity } from 'libs/language-interfaces/src/Time';

if (typeof window !== 'undefined') {
  // JS's runtime woes,
  // Type errors, a painful sight,
  // Soul's aching, my friend.
  try {
    console_hook();
  } catch {
    // in the live connect worker wasm.console_hook is not a function
  }
}

class ComputeBackendSingleton {
  private _computeBackend: ComputeBackend | undefined;

  get computeBackend() {
    if (!this._computeBackend) {
      this._computeBackend = new ComputeBackend();
    }
    return this._computeBackend;
  }
}

const computeBackendSingleton = new ComputeBackendSingleton();

export { computeBackendSingleton, serializeResult, deserializeResult };

export type {
  DeciType,
  Importer,
  ImportOptions,
  ResultType,
} from './wasm/compute_backend';

const assert_never = (a: never): never => {
  return a;
};

export { Kind };
export const kindToDeciType = (kind: Kind): DeciType => {
  switch (kind) {
    case Kind.Number:
      return { type: 'number' };
    case Kind.String:
      return { type: 'string' };
    case Kind.Boolean:
      return { type: 'boolean' };
    case Kind.Date:
      return { type: 'date', specificity: 'none' };
    case Kind.Error:
      return { type: 'error' };
    default:
      return assert_never(kind);
  }
};

export type { DateSpecificity };
export const dateSpecificityToWasm = (date: Specificity): DateSpecificity => {
  switch (date) {
    case 'undefined':
      return 'none';
    default:
      return date;
  }
};
export const dateSpecificityFromWasm = (date: DateSpecificity): Specificity => {
  switch (date) {
    case 'none':
      return 'undefined';
    default:
      return date;
  }
};
