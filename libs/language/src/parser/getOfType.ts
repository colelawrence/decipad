// eslint-disable-next-line no-restricted-imports
import { AST } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';

export function getOfType<
  K extends AST.Node['type'],
  N extends Extract<AST.Node, { type: K }>
>(desiredType: K, node: AST.Node): N {
  if (getDefined(node).type !== desiredType) {
    throw new Error(`getOfType: expected ${desiredType}, found ${node.type}`);
  } else {
    return node as N;
  }
}
