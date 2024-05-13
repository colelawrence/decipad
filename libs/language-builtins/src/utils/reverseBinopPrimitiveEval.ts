import type { BinopPrimitiveEval } from './binopBuiltin';

export const reverseBinopPrimitiveEval =
  (primitiveEval: BinopPrimitiveEval): BinopPrimitiveEval =>
  async (a, b, types) =>
    primitiveEval(b, a, types);
