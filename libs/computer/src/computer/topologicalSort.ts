import { getDefined } from '@decipad/utils';
import { isAssignment } from '@decipad/language';
import { IdentifiedBlock, IdentifiedError } from '../types';
import { getIdentifierString } from '../utils';
import { dependencies, TableNamespaces, findAllTables } from './dependencies';
import { ParseRet } from './parse';

interface Node {
  entity: string | null;
  temporaryMark: boolean;
  permanentMark: boolean;
  edges?: Node[];
  value: IdentifiedBlock;
}

type EntityNodeMap = Map<string, Node>;

const badBlock = (block: ParseRet): block is IdentifiedError => {
  return block.type === 'identified-error';
};

const goodBlock = (block: ParseRet): block is IdentifiedBlock => {
  return block.type !== 'identified-error';
};

const blockEntity = ({ block }: IdentifiedBlock): string | null => {
  if (block.args.length < 1) {
    return null;
  }
  const statement = block.args[0];
  if (!statement || !isAssignment(statement)) {
    return null;
  }
  // we have a statement
  const arg0 = statement.args[0];
  return getIdentifierString(arg0);
};

const blockToNode = (block: IdentifiedBlock): Node => {
  return {
    entity: blockEntity(block),
    temporaryMark: false,
    permanentMark: false,
    value: block,
  };
};

const notSelf = (entity: string) => (node: Node | undefined) =>
  !node || node.entity !== entity;

const drawEdges = (
  node: Node,
  allNodes: EntityNodeMap,
  namespaces: TableNamespaces
): void => {
  const deps = dependencies(node.value.block, namespaces);
  let edges = deps.map((dep) => allNodes.get(dep)).filter(Boolean);
  const { entity } = node;
  if (entity != null) {
    edges = edges.filter(notSelf(entity)) as Node[];
  }
  node.edges = edges as Node[];
};

const identifiedErrorFromNode = (
  node: Node,
  message: string
): IdentifiedError => ({
  ...node.value,
  type: 'identified-error',
  error: {
    blockId: node.value.id,
    message,
  },
});

export const topologicalSort = (blocks: ParseRet[]): ParseRet[] => {
  const errored = blocks.filter(badBlock);
  const sorted: IdentifiedBlock[] = [];

  const goodBlocks = blocks.filter(goodBlock);
  const nodes = goodBlocks.map(blockToNode);

  const identifiersToNode: EntityNodeMap = nodes.reduce((map, node) => {
    if (node.entity !== null) {
      map.set(node.entity, node);
    }
    return map;
  }, new Map());

  const visit = (n: Node): void | Error => {
    if (n.permanentMark) {
      return;
    }
    if (n.temporaryMark) {
      // Circular dep
      const error = new TypeError('Circular dependency detected');
      const errorNode = identifiedErrorFromNode(n, error.message);
      if (!n.permanentMark) {
        n.permanentMark = true;
        errored.push(errorNode);
      }

      return error;
    }
    n.temporaryMark = true;

    for (const edge of getDefined(n.edges)) {
      const error = visit(edge);
      if (error) {
        if (!n.permanentMark) {
          n.permanentMark = true;
          errored.push(identifiedErrorFromNode(n, error.message));
        }
        return error;
      }
    }

    n.temporaryMark = false;
    n.permanentMark = true;
    sorted.push(n.value);
  };

  const depNamespaces = findAllTables(goodBlocks.map((b) => b.block));
  for (const node of nodes) {
    drawEdges(node, identifiersToNode, depNamespaces);
  }

  for (const node of nodes) {
    visit(node);
  }

  return [...sorted, ...errored];
};
