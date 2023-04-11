import { getDefined } from '@decipad/utils';
import { IdentifiedBlock, IdentifiedError, ProgramBlock } from '../types';
import {
  dependencies,
  TableNamespaces,
  findAllTables,
  getDefinedEntity,
} from './dependencies';

interface Node {
  entity: string | null;
  temporaryMark: boolean;
  permanentMark: boolean;
  edges?: Node[];
  value: IdentifiedBlock;
}

type EntityNodeMap = Map<string, Node[]>;

const badBlock = (block: ProgramBlock): block is IdentifiedError => {
  return block.type === 'identified-error';
};

const goodBlock = (block: ProgramBlock): block is IdentifiedBlock => {
  return block.type !== 'identified-error';
};

const blockToNode = (block: IdentifiedBlock): Node => {
  return {
    entity: getDefinedEntity(block.block.args[0]) ?? null,
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
  let edges = deps.flatMap((dep) => allNodes.get(dep)).filter(Boolean);
  const { entity } = node;
  if (entity != null) {
    edges = edges.filter(notSelf(entity)) as Node[];
  }
  node.edges = edges as Node[];
};

const identifiedErrorFromNode = (id: string): IdentifiedError => ({
  type: 'identified-error',
  id,
  errorKind: 'dependency-cycle',
});

export const topologicalSort = (blocks: ProgramBlock[]): ProgramBlock[] => {
  const errored = blocks.filter(badBlock);
  const sorted: IdentifiedBlock[] = [];

  const goodBlocks = blocks.filter(goodBlock);
  const nodes = goodBlocks.map(blockToNode);

  const identifiersToNode = nodes.reduce<EntityNodeMap>((map, node) => {
    if (node.entity !== null) {
      const existing = map.get(node.entity) ?? [];
      map.set(node.entity, existing.concat(node));
    }

    return map;
  }, new Map());

  const visit = (n: Node): void | boolean => {
    if (n.permanentMark) {
      return;
    }
    if (n.temporaryMark) {
      // Circular dep
      const errorNode = identifiedErrorFromNode(n.value.id);
      if (!n.permanentMark) {
        n.permanentMark = true;
        errored.push(errorNode);
      }

      return true;
    }
    n.temporaryMark = true;

    for (const edge of getDefined(n.edges)) {
      const error = visit(edge);
      if (error) {
        if (!n.permanentMark) {
          n.permanentMark = true;
          errored.push(identifiedErrorFromNode(n.value.id));
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
