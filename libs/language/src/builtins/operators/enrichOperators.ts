import { BuiltinSpec } from '../interfaces';

export const enrichOperators = <T extends { [fname: string]: BuiltinSpec }>(
  operators: T
): T => {
  for (const op of Object.values(operators)) {
    if (op.aliasFor && !op.explanation) {
      op.explanation = operators[op.aliasFor]?.explanation;
    }
    if (op.aliasFor && !op.example) {
      op.example = operators[op.aliasFor]?.example;
    }
    if (op.aliasFor && !op.syntax) {
      op.syntax = operators[op.aliasFor]?.syntax;
    }
    if (op.aliasFor && !op.formulaGroup) {
      op.formulaGroup = operators[op.aliasFor]?.formulaGroup;
    }
  }
  return operators;
};
