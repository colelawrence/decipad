// Need this retval ambiguity for the typings to adapt to every kind of AST.Node

import type { AST } from '@decipad/computer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const astNode = <
  T extends AST.Node['type'],
  RetNode extends Extract<AST.Node, { type: T }>
>(
  type: T,
  ...args: RetNode['args']
) => ({ type, args } as RetNode);

export const astColumn = (...items: AST.Expression[]): AST.Column =>
  astNode('column', astNode('column-items', ...items));
