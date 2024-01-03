import { BuiltinSpec } from '../interfaces';

export const enrichOperators = <T extends { [fname: string]: BuiltinSpec }>(
  operators: T
): T => {
  for (const op of Object.values(operators)) {
    if (!op.aliasFor) {
      continue;
    }

    op.explanation = op.explanation ?? operators[op.aliasFor]?.explanation;
    op.example = op.example ?? operators[op.aliasFor]?.example;
    op.syntax = op.syntax ?? operators[op.aliasFor]?.syntax;
    op.formulaGroup = op.formulaGroup ?? operators[op.aliasFor]?.formulaGroup;
  }
  return operators;
};
