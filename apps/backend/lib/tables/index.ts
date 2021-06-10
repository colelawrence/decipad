import arc from '@architect/functions';

const observedTables = [
  'userkeys',
  'permissions',
  'tags',
  'usertaggedresources',
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
        for (const observedTable of observedTables) {
          observe(tables, observedTable);
        }
        resolve(tables);
      })
      .catch(reject);
  });

  return p;
}

async function observe(tables: DataTables, tableName: string) {
  const table = tables[tableName];
  if (!table) {
    throw new Error('No table named ' + tableName);
  }
  if (table.__deci_observed__) {
    return;
  }
  table.__deci_observed__ = true;

  for (const methodName of ['put', 'delete']) {
    const method = methodName === 'put' ? table.put : table.delete;
    const replaceMethod = async (args: any) => {
      const ret = await method.call(table, args);

      await arc.queues.publish({
        name: `${tableName}-changes`,
        payload: {
          table: tableName,
          action: methodName,
          args,
        },
      });

      return ret;
    };

    if (methodName === 'put') {
      table['put'] = replaceMethod;
    } else {
      table['delete'] = replaceMethod;
    }
  }
}
