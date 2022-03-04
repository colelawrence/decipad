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
  EnhancedDataTable,
  TableRecordIdentifier,
  VersionedDataTable,
  VersionedTableRecord,
  VersionedDataTables,
} from '@decipad/backendtypes';
import { withLock, WithLockUserFunction } from '@decipad/dynamodb-lock';
import allPages, { allScanPages } from './all-pages';
import assert from 'assert';
import { timestamp } from './timestamp';

export { allPages, allScanPages };

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
        const tables = _tables as unknown as DataTables;
        for (const enhancedTableName of enhancedTables) {
          enhance(tables, enhancedTableName);
        }
        for (const observedTable of observedTables) {
          observe(tables, observedTable, userId);
        }
        for (const versionedTable of versionedTables) {
          withWithVersion(tables, tables._doc, versionedTable);
        }
        resolve(tables);
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

function enhance(
  dataTables: DataTables,
  tableName: keyof DataTables
): EnhancedDataTable<any> {
  const table = dataTables[tableName] as unknown as EnhancedDataTable<any>;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }

  if (typeof (table as unknown as DataTable<any>).create === 'function') {
    return table;
  }

  // TODO type this magic property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table.create = async function create(doc: any, noEvents = false) {
    if (!doc.createdAt) {
      doc.createdAt = timestamp();
    }

    return table.put(doc, noEvents);
  };
  return table;
}

function withWithVersion(
  dataTables: DataTables,
  db: DocumentClient,
  tableName: keyof VersionedDataTables
): VersionedDataTable<VersionedTableRecord> {
  assert(db, 'need a db');
  const table = dataTables[
    tableName
  ] as VersionedDataTable<VersionedTableRecord>;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }
  const locking = withLock(db, tableName);
  table.withLock = (
    id: string,
    fn: WithLockUserFunction<VersionedTableRecord>
  ) => locking(id, fn);
  return table;
}
