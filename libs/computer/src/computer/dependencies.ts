import { unique } from '@decipad/utils';
import { AST } from '..';
import { getIdentifierString } from '../utils';

export type TableNamespaces = Map<string, Set<string>>;

/** Finds what `node` depends on. `namespaces` can be built in the `findAllTables` function */
export const dependencies = (
  node: AST.Node,
  namespaces: TableNamespaces = new Map()
): string[] => {
  const refs = findRefs(node);
  return excludeLocalNames(refs, getLocalNames(node, namespaces));
};

function findRefs(node: AST.Node): string[] {
  switch (node.type) {
    case 'argument-names':
    case 'catdef':
    case 'coldef':
    case 'date':
    case 'def':
    case 'externalref':
    case 'fetch-data':
    case 'funcdef':
    case 'generic-identifier':
    case 'literal':
    case 'noop': {
      return [];
    }
    case 'block':
    case 'argument-list':
    case 'column-items':
    case 'generic-list':
    case 'matrix-matchers':
    case 'range':
    case 'table':
    case 'table-column-assign':
    case 'table-spread': {
      return unique(node.args.flatMap(findRefs));
    }
    case 'assign':
    case 'categories': {
      return unique(node.args.slice(1).flatMap(findRefs));
    }
    case 'column':
    case 'property-access':
    case 'sequence': {
      return findRefs(node.args[0]);
    }
    case 'directive': {
      const [, ...args] = node.args;
      return unique(args.flatMap(findRefs));
    }
    case 'funcref': {
      return node.args;
    }
    case 'function-call': {
      const [funcName, argList] = node.args;
      return [...findRefs(funcName), ...unique(argList.args.flatMap(findRefs))];
    }
    case 'function-definition': {
      const [name, args, body] = node.args;
      const argNames = findRefs(args);
      const bodyDeps = findRefs(body);
      const externalBodyDeps = bodyDeps.filter(
        (dep) => !argNames.includes(dep)
      );
      return [...findRefs(name), ...externalBodyDeps];
    }
    case 'matrix-assign': {
      const [, where, assignee] = node.args;
      return unique([...findRefs(where), ...findRefs(assignee)]);
    }
    case 'matrix-ref':
    case 'match':
    case 'matchdef':
    case 'tiered':
    case 'tiered-def': {
      return unique(node.args.flatMap(findRefs));
    }
    case 'ref':
    case 'tablepartialdef': {
      return node.args;
    }
    case 'table-column': {
      const [, column] = node.args;
      return findRefs(column);
    }
  }
}

function excludeLocalNames(
  referencesFound: string[],
  localNames: Set<string> | null
) {
  if (localNames == null) return referencesFound;

  return referencesFound.filter((item) => !localNames.has(item));
}

const blocksToStatements = (blocksOrStmts: AST.Node[]): AST.Node[] =>
  blocksOrStmts.flatMap((node) => {
    if (node.type === 'block') {
      return node.args;
    } else {
      return [node];
    }
  });

/** Find tables, and update the namespaces available */
export function findAllTables(nodes: AST.Node[]) {
  const namespaces: TableNamespaces = new Map();

  function namespaceAdd(nsName: string, toAdd: string[]) {
    let ns = namespaces.get(nsName);
    if (ns == null) {
      ns = new Set();
      namespaces.set(nsName, ns);
    }

    for (const name of toAdd) {
      ns.add(name);
    }
  }

  for (const node of blocksToStatements(nodes)) {
    if (node.type === 'assign' && node.args[1].type === 'table') {
      const [name, table] = node.args;
      const ns = getIdentifierString(name);

      const colNames = getTableColNames(table, namespaces);

      namespaceAdd(ns, colNames);
    }
    if (node.type === 'table-column-assign') {
      const [tableName, colName] = node.args;
      const ns = getIdentifierString(tableName);

      namespaceAdd(ns, [getIdentifierString(colName)]);
    }
  }

  return namespaces;
}

function getTableColNames(table: AST.Table, namespaces: TableNamespaces) {
  return table.args.flatMap((colDef) => {
    if (colDef.type === 'table-column') {
      return getIdentifierString(colDef.args[0]);
    } else {
      const spreadTableName = getIdentifierString(colDef.args[0]);
      return [...(namespaces.get(spreadTableName) ?? [])];
    }
  });
}

function getLocalNames(
  nodeOrBlock: AST.Node,
  namespaces: TableNamespaces
): Set<string> | null {
  const names = [];

  for (const node of blocksToStatements([nodeOrBlock])) {
    if (node.type === 'assign' && node.args[1].type === 'table') {
      names.push(getIdentifierString(node.args[0]));
      names.push(...getTableColNames(node.args[1], namespaces));
    }
    if (node.type === 'table-column-assign') {
      const tableName = getIdentifierString(node.args[0]);

      names.push(...(namespaces.get(tableName) ?? new Set()));
    }
    if (node.type === 'function-definition') {
      names.push(...node.args[1].args.map(getIdentifierString));
    }
    if (node.type === 'tiered-def') {
      names.push('slice', 'tier');
    }
  }

  return names.length > 0 ? new Set(names) : null;
}
