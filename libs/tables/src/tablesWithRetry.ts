/* eslint-disable no-underscore-dangle */
import {
  DataTable,
  DataTables,
  EnhancedDataTable,
  TableRecordBase,
} from '@decipad/backendtypes';
import { awsRetry, retry } from '@decipad/retry';
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
        get: (...args) => retry(() => sourceTable.get(...args), awsRetry),
        delete: (...args) => retry(() => sourceTable.delete(...args), awsRetry),
        query: (...args) => retry(() => sourceTable.query(...args), awsRetry),
        put: (doc: TableRecordBase, eventProbability?: boolean | number) =>
          retry(
            () =>
              (sourceTable.put as DataTable<TableRecordBase>['put'])(
                doc,
                eventProbability
              ),
            awsRetry
          ),
      };
      if ('batchGet' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).batchGet = (...args) =>
          retry(
            () =>
              (
                sourceTable.batchGet as EnhancedDataTable<TableRecordBase>['batchGet']
              )(...args),
            awsRetry
          );
      }
      if ('batchDelete' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).batchDelete = (...args) =>
          retry(
            () =>
              (
                sourceTable.batchDelete as EnhancedDataTable<TableRecordBase>['batchDelete']
              )(...args),
            awsRetry
          );
      }
      if ('create' in sourceTable) {
        (table as EnhancedDataTable<TableRecordBase>).create = (...args) =>
          retry(
            () =>
              (
                sourceTable.create as EnhancedDataTable<TableRecordBase>['create']
              )(...args),
            awsRetry
          );
      }
      cache[property] = table as any;
      return table;
    },
  };

  return Promise.resolve(new Proxy(data, handler));
};
