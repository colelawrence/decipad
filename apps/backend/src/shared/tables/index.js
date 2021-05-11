'use strict';

const arc = require('@architect/functions');

const observedTables = ['userkeys'];
const observedMethods = ['put', 'delete'];

const observed = Symbol('deci_observed');

let tablesPromise;

module.exports = async function tables() {
  if (tablesPromise) {
    return tablesPromise;
  }
  const promise = arc.tables();
  const tables = await promise;
  tablesPromise = promise;

  for (const observedTable of observedTables) {
    observe(tables, observedTable);
  }

  return tables;
};

async function observe(tables, tableName) {
  const table = tables[tableName];
  if (table[observed]) {
    return;
  }
  table[observed] = true;

  for (const methodName of observedMethods) {
    const method = table[methodName];
    table[methodName] = async (args) => {
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
  }
}
