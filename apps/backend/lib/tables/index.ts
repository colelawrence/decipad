import arc from '@architect/functions';
import timestamp from '../utils/timestamp';

const enhancedTables: (keyof EnhancedDataTables)[] = [
  'users',
  'userkeys',
  'permissions',
  'workspaces',
  'pads',
  'workspaceroles',
  'invites',
  'futurefileattachments',
  'fileattachments',
];

const observedTables = [
  'userkeys',
  'permissions',
  'tags',
  'usertaggedresources',
  'fileattachments',
];

let tablesPromise: Promise<DataTables>;

export default async function tables(): Promise<DataTables> {
  if (tablesPromise) {
    return tablesPromise;
  }

  const p = new Promise<DataTables>((resolve, reject) => {
    arc
      .tables()
      .then((_tables) => {
        const tables = _tables as unknown as DataTables;
        for (const enhancedTableName of enhancedTables) {
          enhance(tables, enhancedTableName);
        }
        for (const observedTable of observedTables) {
          observe(tables, observedTable);
        }
        resolve(tables);
      })
      .catch(reject);
  });

  return p;
}

function observe(tables: DataTables, tableName: keyof DataTables) {
  const table = tables[tableName];
  if (!table) {
    throw new Error('No table named ' + tableName);
  }
  if (table.__deci_observed__) {
    return;
  }
  table.__deci_observed__ = true;

  table['put'] = putReplacer(table, tableName, table.put);
  table['delete'] = deleteReplacer(table, tableName, table.delete);
}

function putReplacer<T>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (doc: any) => Promise<void>
) {
  return async function putReplacer(args: any) {
    const ret = await method.call(table, args);

    await arc.queues.publish({
      name: `${tableName}-changes`,
      payload: {
        table: tableName,
        action: 'put',
        args,
      },
    });

    return ret;
  };
}

function deleteReplacer<T>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (doc: any) => Promise<void>
) {
  return async function deleteReplacer(args: any) {
    const recordBeforeDelete = await table.get({ id: args.id });
    const ret = await method.call(table, args);

    await arc.queues.publish({
      name: `${tableName}-changes`,
      payload: {
        table: tableName,
        action: 'delete',
        args,
        recordBeforeDelete,
      },
    });

    return ret;
  };
}

function enhance(tables: DataTables, tableName: keyof DataTables) {
  const table = tables[tableName];
  if (!table) {
    throw new Error('No table named ' + tableName);
  }

  if (typeof table.create === 'function') {
    return;
  }

  table.create = async function create(doc: any) {
    if (!doc.createdAt) {
      doc.createdAt = timestamp();
    }

    return table.put(doc);
  };
}
