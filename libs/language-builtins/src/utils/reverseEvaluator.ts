import type { Evaluator } from '../types';

export const reverseEvaluator =
  (evaluator: Evaluator): Evaluator =>
  async (args, argTypes, utils, valueNodes) => {
    return evaluator(
      args.reverse(),
      [...argTypes].reverse(),
      utils,
      [...valueNodes].reverse()
    );
  };
