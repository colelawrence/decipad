import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { mutateAst } from '@decipad/language-utils';
import { N } from '@decipad/number';

export const decodeAST = <TNode extends AST.Node>(_node: TNode): TNode => {
  return mutateAst(_node, (node) => {
    if (node.type === 'literal' && node.args[0] === 'number') {
      return {
        ...node,
        args: [node.args[0], N(node.args[1]), node.args[2]],
      };
    }
    return node;
  }) as TNode;
};
