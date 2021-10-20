// Need this retval ambiguity for the typings to adapt to every kind of AST.Node
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const astNode = <T extends string, A extends unknown[]>(
  type: T,
  ...args: A
) => ({ type, args });
