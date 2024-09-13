import { Result, Value as ResultValue } from '@decipad/language-interfaces';
import { Evaluator } from '../types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { deserializeResult } from '@decipad/compute-backend-js';

export const createWasmEvaluator =
  (
    wasmFunction: (id: string) => void,
    last: (result: Result.Result) => ResultValue.Value,
    jsEvaluator: Evaluator
  ): Evaluator =>
  async (...args) => {
    const value = args[0][0];
    const wasmId = await Value.getWasmId(value);

    if (wasmId != null) {
      console.log('Calling straight to wasm: ', wasmId);
      const wasmRes = wasmFunction(wasmId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deserializedResult = deserializeResult(wasmRes as any);
      return last(deserializedResult);
    }

    return jsEvaluator(...args);
  };
