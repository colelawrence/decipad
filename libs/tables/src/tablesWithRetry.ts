/* eslint-disable no-underscore-dangle */
import {
  DataTable,
  DataTables,
  EnhancedDataTable,
  TableRecordBase,
} from '@decipad/backendtypes';
import { once } from '@decipad/utils';
import { tables } from './tables';

const globalTablesWithoutRetry = once(() => tables());

export const tablesWithRetry = async (): Promise<DataTables> => {
  const dataPromise = globalTablesWithoutRetry();
  const then = dataPromise.then.bind(dataPromise);
  const data = await dataPromise;

  const cache: Partial<DataTables> = {};

  const handler: ProxyHandler<DataTables> = {
    get(target, prop) {
      const property = prop as keyof DataTables | 'then';
      if (property === '_doc') {
        // eslint-disable-next-line no-underscore-dangle
        return data._doc;
      }
      if (property === 'then') {
        return then;
      }
      const cached = cache[property];
      if (cached) {
        return cached;
      }

      const sourceTable = target[property];
      if (!sourceTable) {
        throw new Error(`Could not find table named ${property}`);
      }
      const table: typeof sourceTable = {
        ...sourceTable,
        get: (...args) => sourceTable.get(...args),
        delete: (...args) => sourceTable.delete(...args),
        query: (...args) => sourceTable.query(...args),
        put: (doc: TableRecordBase, eventProbability?: boolean | number) =>
          (sourceTable.put as DataTable<TableRecordBase>['put'])(
            doc,
            eventProbability
          ),
      };
      if ('batchGet' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).batchGet = (...args) =>
          (
            sourceTable.batchGet as EnhancedDataTable<TableRecordBase>['batchGet']
          )(...args);
      }
      if ('batchDelete' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).batchDelete = (...args) =>
          (
            sourceTable.batchDelete as EnhancedDataTable<TableRecordBase>['batchDelete']
          )(...args);
      }
      if ('create' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).create = (...args) =>
          (sourceTable.create as EnhancedDataTable<TableRecordBase>['create'])(
            ...args
          );
      }
      cache[property] = table as any;
      return table;
    },
  };

  return Promise.resolve(new Proxy(data, handler));
};
