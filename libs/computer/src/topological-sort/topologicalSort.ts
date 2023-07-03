import { getDefined } from '@decipad/utils';
import { isAssignment } from '@decipad/language';
import { IdentifiedBlock, IdentifiedError, ProgramBlock } from '../types';
import { dependencies, findAllTables } from '../dependencies';
import { getIdentifierString } from '../utils';
import { getExprRef } from '../exprRefs';
import { prettyPrintProgramBlock } from '../testUtils';

interface Node {
  entities: Set<string>;
  temporaryMark: boolean;
  permanentMark: boolean;
  edges?: Set<Node>;
  value: IdentifiedBlock;
}

type EntityNodeMap = Map<string, Node[]>;

const badBlock = (block: ProgramBlock): block is IdentifiedError => {
  return block.type === 'identified-error';
};

const goodBlock = (block: ProgramBlock): block is IdentifiedBlock => {
  return block.type !== 'identified-error';
};

const blockEntities = ({ block }: IdentifiedBlock): Set<string> => {
  if (block.args.length < 1) {
    return new Set();
  }
  const statement = block.args[0];
  if (!statement || !isAssignment(statement)) {
    return new Set();
  }

  const entities = new Set<string>();

  // we have a statement if we've made it this far
  if (statement.type === 'table-column-assign') {
    const [tablePartialDef, colDef] = statement.args;
    entities.add(`${tablePartialDef.args[0]}::${colDef.args[0]}`);
  } else {
    const arg0 = statement.args[0];
    entities.add(getIdentifierString(arg0));
  }
  entities.add(getExprRef(block.id));

  return entities;
};

const blockToNode = (block: IdentifiedBlock): Node => {
  return {
    entities: blockEntities(block),
    temporaryMark: false,
    permanentMark: false,
    value: block,
  };
};

const notSelf = (entities: string[]) => (node: Node | undefined) =>
  !node || entities.every((ent) => !node.entities.has(ent));

type GetDepsFunction = (node: Node) => string[];

const drawEdges = (
  node: Node,
  allNodes: EntityNodeMap,
  getDeps: GetDepsFunction
): void => {
  const deps = getDeps(node);

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

  const { entities } = node;
  edges = edges.filter(notSelf(Array.from(entities))) as Node[];
  node.edges = new Set(edges) as Set<Node>;
};

const identifiedErrorFromNode = (id: string): IdentifiedError => ({
  type: 'identified-error',
  id,
  errorKind: 'dependency-cycle',
});

const isTesting = !!process.env.JEST_WORKER_ID;

export const topologicalSort = (blocks: ProgramBlock[]): ProgramBlock[] => {
  const errored = blocks.filter(badBlock);
  const sorted: IdentifiedBlock[] = [];

  // get nodes
  const goodBlocks = blocks.filter(goodBlock);
  const nodes = goodBlocks.map(blockToNode);

  const identifiersToNode = nodes.reduce<EntityNodeMap>((map, node) => {
    for (const entity of node.entities) {
      const existing = map.get(entity) ?? [];
      map.set(entity, existing.concat(node));
    }

    return map;
  }, new Map());

  const visit = (n: Node): void | boolean => {
    if (n.permanentMark) {
      return;
    }
    if (n.temporaryMark) {
      // Circular dep
      if (!isTesting) {
        console.error(
          'node has a dependency cycle',
          n.value.id,
          prettyPrintProgramBlock(n.value)
        );
        console.error(
          'node depends on',
          Array.from(n.edges ?? []).map((edge) => [
            prettyPrintProgramBlock(edge.value),
            Array.from(edge.edges ?? []).map((edge) => edge.value.id),
          ])
        );
      }
      if (!n.permanentMark) {
        const errorNode = identifiedErrorFromNode(n.value.id);
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

  // draw edges
  const depNamespaces = findAllTables(goodBlocks.map((b) => b.block));
  const tableToFirstColMap = new Map<string, Node>();
  const getDeps: GetDepsFunction = (node) => {
    const deps = dependencies(node.value.block, depNamespaces);
    const statement = node.value.block.args[0];

    // a table column depends implicitly on the first column (which defines the table size)
    if (
      statement.type === 'table-column-assign' &&
      node.value.definesTableColumn
    ) {
      const parentPos = statement.args[3];
      if (parentPos === 0) {
        tableToFirstColMap.set(node.value.definesTableColumn[0], node);
      } else {
        // this column is not the first, so it depends on the first column
        const tableToFirstCol = tableToFirstColMap.get(
          node.value.definesTableColumn[0]
        );
        if (tableToFirstCol) {
          for (const entity of tableToFirstCol.entities) {
            deps.push(entity);
          }
        }
      }
    }
    return deps;
  };
  for (const node of nodes) {
    drawEdges(node, identifiersToNode, getDeps);
  }

  // Make a dictionary of all the tables and their columns
  const tables: { [tableName: string]: Node[] } = {};
  for (const node of nodes) {
    for (const entity of node.entities) {
      const split = entity.split('::');
      if (split?.length !== 2) continue;

      const [table] = split;
      if (tables[table] === undefined) {
        tables[table] = [node];
      } else {
        tables[table].push(node);
      }
    }
  }

  const nodeIsTable = (node: Node): [string, Node[]] | undefined => {
    for (const entity of node.entities) {
      const table = tables[entity];
      if (table) {
        return [entity, table];
      }
    }
    return undefined;
  };

  // if some node A has a table as a dep, and A is not a property of that table, add all the table's columns as a dep
  for (const node of nodes) {
    if (!node.edges) continue;
    for (const edge of node.edges) {
      const pointsToTable = nodeIsTable(edge);
      if (!pointsToTable) {
        continue;
      }
      const [table, columns] = pointsToTable;
      const tableOrColumnEntities: Set<string> = new Set([
        table,
        ...columns.flatMap((n) => Array.from(n.entities)),
      ]);
      if (
        node.entities.size > 0 &&
        Array.from(node.entities).every(
          (nodeEnt) => !tableOrColumnEntities.has(nodeEnt)
        )
      ) {
        for (const col of columns) {
          node.edges.add(col);
        }
      }
    }
  }

  // Useful for debugging
  for (const node of nodes) {
    visit(node);
  }

  return [...sorted, ...errored];
};
