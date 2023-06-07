import { canonicalize } from 'json-canonicalize';
import md5 from 'md5';
import omit from 'lodash.omit';
import { AST } from '.';
import { isNode, walkAst } from '../utils';

const annotateWithCacheKeyNodeTypes = new Set<AST.Node['type']>([
  'function-call',
]);

const ommitableProperties: Array<keyof AST.Node> = ['start', 'end'];

const shouldAnnotateNodeWithCacheKey = (node: AST.Node): boolean =>
  annotateWithCacheKeyNodeTypes.has(node.type);

const stripNode = <T extends AST.Node>(node: T): T => {
  return {
    ...omit(node, ommitableProperties),
    args: node.args.map((arg) => (isNode(arg) ? stripNode(arg) : arg)),
  } as T;
};

const cacheKeyForNode = (node: AST.Node): string => {
  const strippedNode = stripNode(node);
  const json = canonicalize(strippedNode);
  return md5(json) + node.type + json.length;
};

const annotateNodeWithCacheKey = (node: AST.Node): void => {
  if (shouldAnnotateNodeWithCacheKey(node)) {
    node.cacheKey = cacheKeyForNode(node);
  }
};

export const annotateWithCacheKeys = (block: AST.Block): AST.Block => {
  walkAst(block, annotateNodeWithCacheKey);
  return block;
};
