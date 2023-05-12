import { getDefined } from '@decipad/utils';
import { isAssignment } from '@decipad/language';
import { IdentifiedBlock, IdentifiedError, ProgramBlock } from '../types';
import { dependencies, TableNamespaces, findAllTables } from './dependencies';

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

const blockEntity = ({ block }: IdentifiedBlock): string | null => {
  if (block.args.length < 1) {
    return null;
  }
  const statement = block.args[0];
  if (!statement || !isAssignment(statement)) {
    return null;
  }

  // we have a statement if we've made it this far
  if (statement.type === 'table-column-assign') {
    const [tablePartialDef, colDef] = statement.args;
    return `${tablePartialDef.args[0]}::${colDef.args[0]}`;
  }

  const arg0 = statement.args[0];
  return arg0.args[0];
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

  // Filter out builtin functions etc.
  let edges = deps
    .flatMap((dep) => {
      const node = allNodes.get(dep);
      if (node) {
        return node;
      }

      // If a table is derived from a function like "filter" or "lookup" then its column
      // declarations won't exist so we just add the table declaration as a dep instead.
      const tableName = dep.includes('::') && dep.split('::')[0];
      if (!tableName) return undefined;
      return allNodes.get(tableName);
    })
    .filter(Boolean);

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

  // Make a dictionary of all the tables and their columns
  const tables: { [tableName: string]: Node[] } = {};
  for (const node of nodes) {
    const split = node.entity?.split('::');
    if (split?.length !== 2) continue;

    const [table] = split;
    if (tables[table] === undefined) {
      tables[table] = [node];
    } else {
      tables[table].push(node);
    }
  }

  // if some node A has a table as a dep, and A is not a property of that table, add all the table's columns as a dep
  for (const node of nodes) {
    if (!node.edges) continue;
    for (const edge of node.edges) {
      const cols = edge.entity !== null && tables[edge.entity];
      if (!cols) continue;

      // if node is a column declaration, and edge is the table of that column then we skip
      let match: RegExpExecArray | null;
      if (node.entity && (match = /^(.+)::.+$/.exec(node.entity))) {
        const [, tableName] = match;
        if (tableName === edge.entity) {
          continue;
        }
      }

      for (const col of cols) {
        node.edges.push(col);
      }
    }
  }

  // Useful for debugging
  for (const node of nodes) {
    visit(node);
  }

  return [...sorted, ...errored];
};
