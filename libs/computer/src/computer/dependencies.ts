import { unique } from '@decipad/utils';
import { AST } from '..';
import { getIdentifierString } from '../utils';

export type TableNamespaces = Map<string, Set<string>>;

const deriveTableExpressionRef = (
  node: AST.Expression
): { tableRef: string; otherRefs: string[] } | undefined => {
  if (node.type !== 'function-call') return;

  const [, argList] = node.args;
  // It just so happens that all table-returning functions currently return a table with the same
  // type as their first arg, but this might not always be the case. Really we need a more systematic
  // approach to deciding which arg to use as the table's type.
  const firstArg = argList.args[0];
  if (firstArg.type !== 'ref') return;
  const firstArgRefString = getIdentifierString(firstArg);
  return { tableRef: firstArgRefString, otherRefs: dependencies(node) };
};

/** Finds what `node` depends on. `namespaces` can be built in the `findAllTables` function.
 * If we're in a table context (e.g. `Table.Col1 = 1`), then we can use the `namespaces` to
 * find out what columns are available in the table.
 *
 * Table columns are denoted as TableName::ColumnName
 */

export const dependencies = (
  initialNode: AST.Node,
  namespaces: TableNamespaces = new Map()
): string[] => {
  if (initialNode.type === 'block') {
    // We need to get to the statement level
    return unique(
      initialNode.args.flatMap((node) => dependencies(node, namespaces))
    );
  }

  const localNames = getLocalNames(initialNode, namespaces) ?? new Set();
  const localTableName = ((node: AST.Node) => {
    if (node.type === 'table') {
      return getIdentifierString(node.args[0]);
    }
    if (node.type === 'table-column-assign') {
      return getIdentifierString(node.args[0]);
    }
    return undefined;
  })(initialNode);

  function findRefs(node: AST.Node): string[] {
    switch (node.type) {
      case 'argument-names':
      case 'catdef':
      case 'coldef':
      case 'date':
      case 'def':
      case 'tabledef':
      case 'externalref':
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
      case 'table-column-assign': {
        return unique((node.args.slice(0, 3) as AST.Node[]).flatMap(findRefs));
      }
      case 'assign':
      case 'table':
      case 'categories': {
        return unique(node.args.slice(1).flatMap(findRefs));
      }
      case 'column':
      case 'sequence': {
        return findRefs(node.args[0]);
      }
      case 'property-access': {
        const [table, columnRef] = node.args;
        const column = getIdentifierString(columnRef);

        if (table.type === 'ref') {
          return unique([`${table.args[0]}::${column}`]);
        }

        // If the table isn't referred to by name try to derive the table
        const derivedTableRef = deriveTableExpressionRef(table);

        if (derivedTableRef) {
          return unique([
            `${derivedTableRef.tableRef}::${column}`,
            ...derivedTableRef.otherRefs,
          ]);
        }
        const tableRefs = findRefs(table);
        const columnRefs = findRefs(columnRef);

        return unique([
          ...tableRefs,
          // colref handled below
          ...columnRefs,
        ]);
      }
      case 'colref': {
        const colName = getIdentifierString(node);

        // TODO no idea what table this is, let's just do all of them
        // In the future we can improve this by making sure
        // That all column names are globally unique!
        return unique(
          [...namespaces].flatMap(([table, columns]) =>
            columns.has(colName) ? [`${table}::${colName}`] : []
          )
        );
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
        return [
          ...findRefs(funcName),
          ...unique(argList.args.flatMap(findRefs)),
        ];
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
      case 'ref': {
        if (localNames.has(node.args[0])) {
          if (localTableName != null) {
            return [`${localTableName}::${node.args[0]}`];
          } else {
            // Ignore function arguments
            return [];
          }
        }
        return node.args;
      }
      case 'tablepartialdef': {
        return node.args;
      }
      case 'table-column': {
        const [, column] = node.args;
        return findRefs(column);
      }
    }
  }
  return findRefs(initialNode);
};

export const getDefinedEntity = (statement?: AST.Statement) => {
  switch (statement?.type) {
    case 'assign':
    case 'function-definition':
    case 'table': {
      return getIdentifierString(statement.args[0]);
    }

    case 'table-column-assign': {
      return `${getIdentifierString(statement.args[0])}::${getIdentifierString(
        statement.args[1]
      )}`;
    }

    default: {
      return undefined;
    }
  }
};

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
    if (node.type === 'table') {
      const ns = getIdentifierString(node.args[0]);
      const colNames = getTableColNames(node);

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

function getTableColNames(table: AST.Table) {
  return table.args.flatMap((colDef) => {
    if (colDef.type === 'table-column') {
      return getIdentifierString(colDef.args[0]);
    } else {
      return [];
    }
  });
}

function getLocalNames(
  nodeOrBlock: AST.Node,
  namespaces: TableNamespaces
): Set<string> | null {
  const names = [];

  for (const node of blocksToStatements([nodeOrBlock])) {
    if (node.type === 'table') {
      names.push(getIdentifierString(node.args[0]));
      names.push(...getTableColNames(node));
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
