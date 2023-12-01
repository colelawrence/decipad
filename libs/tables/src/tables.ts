/* eslint-disable no-underscore-dangle */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import arc from '@architect/functions';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type {
  ConcreteDataTable,
  ConcreteRecord,
  DataTable,
  DataTables,
  EnhancedDataTable,
  EnhancedDataTables,
  TableName,
  TableRecordIdentifier,
  VersionedDataTable,
  VersionedDataTables,
  VersionedTableRecord,
} from '@decipad/backendtypes';
import { OBSERVED } from '@decipad/backendtypes';
import { withLock, WithLockUserFunction } from '@decipad/dynamodb-lock';
import { unique } from '@decipad/utils';
import assert from 'assert';
import { timestamp } from './timestamp';
import { debug } from './debug';
import { batchDelete } from './batchDelete';

interface ArcServices {
  tables: Record<TableName, string>;
}

type Arc = typeof arc & {
  services: () => Promise<ArcServices>;
};

const enhancedTables: (keyof EnhancedDataTables)[] = [
  'docsyncupdates',
  'users',
  'userkeys',
  'usergoals',
  'userbackups',
  'permissions',
  'workspaces',
  'pads',
  'sections',
  'workspaceroles',
  'invites',
  'futurefileattachments',
  'fileattachments',
  'externaldatasources',
  'externaldatasourcekeys',
  'secrets',
  'workspacesubscriptions',
];

const observedTables: (keyof DataTables)[] = [
  'userkeys',
  'permissions',
  'tags',
  'usertaggedresources',
  'fileattachments',
  'docsyncupdates',
  'docsyncsnapshots',
  'userbackups',
];

const versionedTables: (keyof VersionedDataTables)[] = ['docsync'];

let tablesPromise: Promise<DataTables>;

export const tables = (): Promise<DataTables> => {
  if (tablesPromise) {
    return tablesPromise;
  }

  const p = new Promise<DataTables>((resolve, reject) => {
    Promise.all([(arc as Arc).services(), arc.tables()])
      .then(([services, _tables]) => {
        const tables = _tables as unknown as DataTables;
        for (const enhancedTableName of enhancedTables) {
          enhance(
            tables,
            enhancedTableName as TableName,
            tables._doc,
            services as ArcServices
          );
        }
        for (const observedTable of observedTables) {
          observe(tables, observedTable);
        }
        for (const versionedTable of versionedTables) {
          withWithVersion(tables, tables._doc, versionedTable);
        }
        resolve(tables);
      })
      .catch(reject);
  });

  tablesPromise = p;

  return p;
};

function observe(dataTables: DataTables, tableName: keyof DataTables) {
  const table = dataTables[tableName] as ConcreteDataTable;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }
  if (table[OBSERVED]) {
    return;
  }

  let putCache: ReturnType<typeof putReplacer>;
  let deleteCache: ReturnType<typeof deleteReplacer>;

  Object.assign(table, {
    [OBSERVED]: true,
    get put() {
      if (!putCache) {
        putCache = putReplacer(table, tableName, table.put);
      }
      return putCache;
    },
    get delete() {
      if (!deleteCache) {
        deleteCache = deleteReplacer(table, tableName, table.delete);
      }
      return deleteCache;
    },
  });
}

function randomPublish(eventProbability: number): boolean {
  return Math.random() <= eventProbability;
}

function putReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (doc: T) => Promise<void>
): (doc: T, eventProbability?: boolean | number) => Promise<void> {
  return async function replacePut(args: T, eventProbability = false) {
    debug(
      'tables.%s.put(%j, eventProbability=%j)',
      tableName,
      args,
      eventProbability
    );
    const ret = method.call(table, args);

    const publishEvent =
      (tableName !== 'docsyncupdates' ||
        !process.env.DECI_NO_DOCSYNC_UPDATE_CHANGES) &&
      (typeof eventProbability === 'boolean'
        ? eventProbability
        : randomPublish(eventProbability));

    if (publishEvent) {
      const event = {
        name: `${tableName}-changes`,
        payload: {
          table: tableName,
          action: 'put',
          args,
        },
      };
      debug('tables.%s: publishing event `%j`', event);
      await arc.queues.publish(event);
      debug('tables.%s: published`', event);
    } else {
      debug('tables.%s: NOT publishing event', tableName);
    }

    return ret;
  };
}

function deleteReplacer<T extends ConcreteRecord>(
  table: DataTable<T>,
  tableName: keyof DataTables,
  method: (id: TableRecordIdentifier) => Promise<void>
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
        },
      });
    }
  };
}

function enhance(
  dataTables: DataTables,
  tableName: TableName,
  db: DynamoDBDocument,
  services: ArcServices
): EnhancedDataTable<any> {
  const table = dataTables[
    tableName as keyof DataTables
  ] as unknown as EnhancedDataTable<any>;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }
  const realTableName = services.tables[tableName];
  if (!realTableName) {
    throw new Error(`could not find real table name for table ${tableName}`);
  }

  if (typeof (table as unknown as DataTable<any>).create === 'function') {
    return table;
  }

  let createCache: EnhancedDataTable<any>['create'];
  let batchGetCache: EnhancedDataTable<any>['batchGet'];
  let batchDeleteCache: EnhancedDataTable<any>['batchDelete'];

  Object.assign(table, {
    get create() {
      if (!createCache) {
        createCache = async (doc: any, noEvents = false) => {
          if (!doc.createdAt) {
            /* eslint-disable-next-line no-param-reassign */
            doc.createdAt = timestamp();
          }
          return table.put(doc, noEvents);
        };
      }
      return createCache;
    },
    get batchGet() {
      if (!batchGetCache) {
        batchGetCache = async (ids: string[]) => {
          debug(`${tableName}:batchGet`, ids);
          const uniqueIds = unique(ids);
          if (uniqueIds.length < 1) {
            return [];
          }
          const query = {
            RequestItems: {
              [realTableName]: { Keys: uniqueIds.map((id) => ({ id })) },
            },
          };
          return db
            .batchGet(query)
            .then((data) => data.Responses?.[realTableName] ?? []);
        };
      }
      return batchGetCache;
    },
    get batchDelete() {
      if (!batchDeleteCache) {
        batchDeleteCache = async (selectors) => {
          debug(`${tableName}:batchDelete`, selectors);
          if (selectors.length < 1) {
            return;
          }
          return batchDelete(db, realTableName, selectors);
        };
      }
      return batchDeleteCache;
    },
  });
  return table;
}

function withWithVersion(
  dataTables: DataTables,
  db: DynamoDBDocument,
  tableName: keyof VersionedDataTables
): VersionedDataTable<VersionedTableRecord> {
  assert(db, 'need a db');
  const table = dataTables[
    tableName
  ] as VersionedDataTable<VersionedTableRecord>;
  if (!table) {
    throw new Error(`No table named ${tableName}`);
  }

  let withLockCache: VersionedDataTable<VersionedTableRecord>['withLock'];

  Object.assign(table, {
    get withLock() {
      if (!withLockCache) {
        const locking = withLock(db, tableName);
        withLockCache = (
          id: string,
          fn: WithLockUserFunction<VersionedTableRecord>
        ) => locking(id, fn);
      }
      return withLockCache;
    },
  });

  return table;
}
