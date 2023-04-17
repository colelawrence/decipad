/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import arc from '@architect/functions';
import {
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
import { withLock, WithLockUserFunction } from '@decipad/dynamodb-lock';
import { unique } from '@decipad/utils';
import { awsRetry, retry } from '@decipad/retry';
import assert from 'assert';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
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
  if (table.__deci_observed__) {
    return;
  }
  table.__deci_observed__ = true;

  table.put = putReplacer(table, tableName, table.put);
  table.delete = deleteReplacer(table, tableName, table.delete);
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
    const ret = await retry(() => method.call(table, args), awsRetry, {
      maxTimeout: 5000,
    });

    const publishEvent =
      typeof eventProbability === 'boolean'
        ? eventProbability
        : randomPublish(eventProbability);

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
      await retry(() => arc.queues.publish(event), awsRetry, {
        maxTimeout: 5000,
      });
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
      await retry(
        () =>
          arc.queues.publish({
            name: `${tableName}-changes`,
            payload: {
              table: tableName,
              action: 'delete',
              args,
              recordBeforeDelete,
            },
          }),
        awsRetry,
        { maxTimeout: 5000 }
      );
    }
  };
}

function enhance(
  dataTables: DataTables,
  tableName: TableName,
  db: DocumentClient,
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

  // TODO type this magic property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table.create = async function create(doc: any, noEvents = false) {
    if (!doc.createdAt) {
      doc.createdAt = timestamp();
    }

    return table.put(doc, noEvents);
  };

  table.batchGet = async function batchGet(ids: string[]) {
    debug(tableName + ':batchGet', ids);
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
      .promise()
      .then((data) => data.Responses?.[realTableName] ?? []);
  };

  table.batchDelete = async (selectors) => {
    debug(tableName + ':batchDelete', selectors);
    if (selectors.length < 1) {
      return;
    }
    return batchDelete(db, realTableName, selectors);
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
