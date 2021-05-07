'use strict';

const arc = require('@architect/functions');

const observedTables = ['userkeys'];

const observedMethods = ['put', 'delete'];

module.exports = async function tables() {
  const tables = await arc.tables();

  for (const observedTable of observedTables) {
    observe(tables, observedTable);
  }

  return tables;
};

async function observe(tables, tableName) {
  const table = tables[tableName];
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
