import { getDefined } from '@decipad/utils';
import { AST } from '..';
import {
  chooseFirst,
  deLinearizeType,
  linearizeType,
} from '../dimtools/common';
import { materializeToValue } from '../dimtools/materialize';
import { DimensionalValue } from '../dimtools/multidimensional-utils';
import { SwappedHypercube } from '../dimtools/SwappedHypercube';
import { build as t, InferError } from '../type';
import { getIdentifierString, getOfType } from '../utils';
import { Directive } from './types';

const cleanAST = (...args: AST.Node[]) =>
  [
    args[0] as AST.Expression,
    getIdentifierString(getOfType('generic-identifier', args[1])),
  ] as const;

export const over: Directive = {
  argCount: 2,
  async getType({ infer }, ...args) {
    const [matrix, indexName] = cleanAST(...args);

    return (await infer(matrix)).isColumn().mapType((matrix) => {
      const types = linearizeType(matrix);
      const scalarTip = getDefined(types.pop());

      const dimIndex = types.findIndex((t) => t.indexedBy === indexName);
      if (dimIndex === -1) {
        return t.impossible(InferError.unknownCategory(indexName));
      }

      return deLinearizeType([...chooseFirst(dimIndex, types), scalarTip]);
    });
  },
  async getValue({ evaluate, getNodeType }, ...args) {
    const [matrix, indexName] = cleanAST(...args);

    const value = await evaluate(matrix);
    const type = await getNodeType(matrix);

    const swapped = new SwappedHypercube(
      DimensionalValue.fromValue(value, type),
      indexName
    );

    return materializeToValue(swapped);
  },
};
