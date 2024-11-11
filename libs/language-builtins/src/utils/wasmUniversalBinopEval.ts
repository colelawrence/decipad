import { Result, Value } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Type, serializeType, resultToValue } from '@decipad/language-types';
import {
  serializeResult,
  deserializeResult,
  getDeserializeResultArg,
} from '@decipad/compute-backend-js';

export type WasmEvaluate = (a: object, b: object, c: boolean) => unknown;

export type TargetEval = (
  a: Result.OneResult,
  b: Result.OneResult,
  [aType, bType]: Type[]
) => Promise<Value.Value>;

export const wasmUniversalBinopEval =
  (evaluate: WasmEvaluate): TargetEval =>
  async (a, b, [aType, bType]): Promise<Value.Value> => {
    const aSer = await serializeResult({
      type: serializeType(aType),
      value: a,
    });
    const bSer = await serializeResult({
      type: serializeType(bType),
      value: b,
    });
    if ((await bType.reducedToLowest()).numberFormat === 'percentage') {
      if ((await aType.reducedToLowest()).numberFormat === 'percentage') {
        return resultToValue(
          deserializeResult(
            getDeserializeResultArg(evaluate(aSer, bSer, false))
          )
        );
      } else {
        return resultToValue(
          deserializeResult(getDeserializeResultArg(evaluate(aSer, bSer, true)))
        );
      }
    } else {
      return resultToValue(
        deserializeResult(getDeserializeResultArg(evaluate(aSer, bSer, false)))
      );
    }
  };
