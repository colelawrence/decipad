/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-relative-packages
import { ComputeBackend } from './wasm/compute_backend';
import { serializeResult, deserializeResult } from './serializableResult';

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
