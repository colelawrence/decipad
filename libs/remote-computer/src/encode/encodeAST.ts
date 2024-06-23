import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { mutateAst } from '@decipad/language-utils';

export const encodeAST = <TNode extends AST.Node>(_node: TNode): TNode => {
  return mutateAst(_node, (node) => {
    if (node.type === 'literal' && node.args[0] === 'number') {
      return {
        ...node,
        args: node.args,
      };
    }
    return node;
  }) as TNode;
};
