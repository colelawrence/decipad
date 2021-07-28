import arc from '@architect/functions';
import {
  DataTables,
  EnhancedDataTables,
  ConcreteRecord,
  ConcreteDataTable,
  DataTable,
  TableRecordIdentifier,
} from '@decipad/backendtypes';
import timestamp from '../common/timestamp';
import allPages from './all-pages';

export { allPages };

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

const observedTables: (keyof DataTables)[] = [
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
  const table = tables[tableName] as ConcreteDataTable;
  if (!table) {
    throw new Error('No table named ' + tableName);
  }
  if (table.__deci_observed__) {
    return;
  }
  table.__deci_observed__ = true;

  const put = putReplacer(table, tableName, table.put);
  const del = deleteReplacer(table, tableName, table.delete);
  Object.assign(table, { put, delete: del });
}

function putReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (doc: T) => Promise<void>
): (doc: T) => Promise<void> {
  return async function putReplacer(args: T) {
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

function deleteReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (id: TableRecordIdentifier) => Promise<void>
): (id: TableRecordIdentifier) => Promise<void> {
  return async function deleteReplacer(args: TableRecordIdentifier) {
    const recordBeforeDelete = await table.get({ id: args.id });
    await method.call(table, args);

    await arc.queues.publish({
      name: `${tableName}-changes`,
      payload: {
        table: tableName,
        action: 'delete',
        args,
        recordBeforeDelete,
      },
    });
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
