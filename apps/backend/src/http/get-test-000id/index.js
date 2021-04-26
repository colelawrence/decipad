const arc = require('@architect/functions');
const handle = require('@architect/shared/handle');

exports.handler = handle(async (req) => {
  const tables = await arc.tables();
  return tables.test.get({ key: req.pathParameters.id });
});
