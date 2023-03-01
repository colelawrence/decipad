import { BuiltinSpec } from '../interfaces';

export const enrichOperators = <T extends { [fname: string]: BuiltinSpec }>(
  operators: T
): T => {
  for (const op of Object.values(operators)) {
    if (op.aliasFor && !op.explanation) {
      op.explanation = operators[op.aliasFor]?.explanation;
    }
  }
  return operators;
};
