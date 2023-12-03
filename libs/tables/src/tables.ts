/* eslint-disable no-underscore-dangle */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import arc from '@architect/functions';
import type { DataTables } from '@decipad/backendtypes';
import { tablesProp } from './table';
import { Arc, ArcServices } from './types';

let tablesPromise: Promise<DataTables>;

const internalTables = async (): Promise<DataTables> => {
  const [services, _tables] = await Promise.all([
    (arc as Arc).services(),
    arc.tables(),
  ]);
  const tables = _tables as unknown as DataTables;
  const cache = new Map<string | symbol, unknown>();

  const handler: ProxyHandler<DataTables> = {
    get(tables, prop) {
      let cached = cache.get(prop);
      if (!cached) {
        cached = tablesProp(
          tables,
          services as ArcServices,
          prop as keyof DataTables
        );
        cache.set(prop, cached);
      }
      return cached;
    },
  };

  return new Proxy<DataTables>(tables, handler);
};

export const tables = (): Promise<DataTables> => {
  if (!tablesPromise) {
    tablesPromise = internalTables();
  }
  return tablesPromise;
};
