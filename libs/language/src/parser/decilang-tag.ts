import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { mutateAst, isNode, isIdentifier } from '@decipad/language-utils';
import { parseStatementOrThrow } from '..';

/**
 * Construct a bit of decilang, and interpolate identifiers or other
 * decilang ASTs.
 *
 * @example
 *     const someExpressionAst = decilang`1 + 2`;
 *     decilang`${{ name: 'MyVarName' }} = [1, 2, ${someExpressionAst}]`
 */
export const decilang = <RetType extends AST.Statement = AST.Statement>(
  strings: TemplateStringsArray,
  ...interpolations: (AST.Node | { name: string })[]
): RetType => {
  // eslint-disable-next-line no-restricted-globals
  const idsToInterpolations = new Map<string, AST.Node | { name: string }>();

  const codeWithIds = strings
    .map((s, i) => {
      const arg = interpolations[i];
      if (!arg) return s;

      const id = `id__${Math.floor(Math.random() * 9999999)}`;
      idsToInterpolations.set(id, arg);
      return `${s}${id}`;
    })
    .join('');

  const result = parseStatementOrThrow(codeWithIds);

  // Find our randomly generated IDs
  return interpolate(result, idsToInterpolations) as RetType;
};

const interpolate = (
  parsed: AST.Statement,
  idsToInterpolations: Map<string, AST.Node | { name: string }>
): AST.Statement => {
  return mutateAst(parsed, (node) => {
    const toReplace =
      isIdentifier(node) && idsToInterpolations.get(node.args[0]);

    if (!toReplace) return node;

    // Replace with a provided AST.Node/name

    if (isNode(toReplace)) {
      return toReplace;
    }

    if (typeof toReplace === 'object' && 'name' in toReplace) {
      node.args[0] = toReplace.name;
      return node;
    }

    throw new Error('unreachable');
  }) as AST.Statement;
};
