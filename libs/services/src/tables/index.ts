/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import arc from '@architect/functions';
import {
  ConcreteDataTable,
  ConcreteRecord,
  DataTable,
  DataTables,
  EnhancedDataTables,
  TableRecordIdentifier,
  VersionedDataTable,
  VersionedTableRecord,
  VersionedDataTables,
} from '@decipad/backendtypes';
import { withLock, WithLockUserFunction } from '@decipad/dynamodb-lock';
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
  'externaldatasources',
  'externaldatasourcekeys',
];

const observedTables: (keyof DataTables)[] = [
  'userkeys',
  'permissions',
  'tags',
  'usertaggedresources',
  'fileattachments',
  'docsyncupdates',
  'allowlist',
];

const versionedTables: (keyof VersionedDataTables)[] = ['docsync'];

let tablesPromise: Promise<DataTables>;

export default async function tables(userId?: string): Promise<DataTables> {
  if (tablesPromise && !userId) {
    return tablesPromise;
  }

  const p = new Promise<DataTables>((resolve, reject) => {
    arc
      .tables()
      .then((_tables) => {
        const dataTables = { ..._tables } as unknown as DataTables;
        for (const enhancedTableName of enhancedTables) {
          enhance(dataTables, enhancedTableName);
        }
        for (const observedTable of observedTables) {
          observe(dataTables, observedTable, userId);
        }
        for (const versionedTable of versionedTables) {
          withWithVersion(dataTables, arc.tables.doc, versionedTable);
        }
        resolve(dataTables);
      })
      .catch(reject);
  });

  if (!userId) {
    tablesPromise = p;
  }

  return p;
}

function observe(
  dataTables: DataTables,
  tableName: keyof DataTables,
  userId?: string
) {
  const table = dataTables[tableName] as ConcreteDataTable;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }
  if (table.__deci_observed__) {
    return;
  }
  table.__deci_observed__ = true;

  table.put = putReplacer(table, tableName, table.put, userId);
  table.delete = deleteReplacer(table, tableName, table.delete, userId);
}

function putReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (doc: T) => Promise<void>,
  userId?: string
): (doc: T, noEvents?: boolean) => Promise<void> {
  return async function replacePut(args: T, noEvents = false) {
    const ret = await method.call(table, args);

    if (!noEvents) {
      await arc.queues.publish({
        name: `${tableName}-changes`,
        payload: {
          table: tableName,
          action: 'put',
          args,
          user_id: userId,
        },
      });
    }

    return ret;
  };
}

function deleteReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (id: TableRecordIdentifier) => Promise<void>,
  userId?: string
): (id: TableRecordIdentifier, noEvents: boolean) => Promise<void> {
  return async function replaceDelete(
    args: TableRecordIdentifier,
    noEvents = false
  ) {
    const recordBeforeDelete = !noEvents ?? (await table.get({ id: args.id }));
    await method.call(table, args);

    if (!noEvents) {
      await arc.queues.publish({
        name: `${tableName}-changes`,
        payload: {
          table: tableName,
          action: 'delete',
          args,
          recordBeforeDelete,
          user_id: userId,
        },
      });
    }
  };
}

function enhance(dataTables: DataTables, tableName: keyof DataTables) {
  const table = dataTables[tableName];
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }

  if (typeof table.create === 'function') {
    return;
  }

  // TODO type this magic property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table.create = async function create(doc: any, noEvents = false) {
    if (!doc.createdAt) {
      doc.createdAt = timestamp();
    }

    return table.put(doc, noEvents);
  };
}

function withWithVersion(
  dataTables: DataTables,
  db: DocumentClient,
  tableName: keyof VersionedDataTables
) {
  const table = dataTables[tableName];
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }
  const locking = withLock(db, tableName);
  (table as VersionedDataTable<VersionedTableRecord>).withLock = (
    id: string,
    fn: WithLockUserFunction<VersionedTableRecord>
  ) => locking(id, fn);
}
