const handle = require('@architect/shared/handle');
const syncGet = require('@architect/shared/sync/get');
const uri = require('@architect/shared/uri');

exports.handler = handle(async () => {
  const id = uri('workspaces');
  return await syncGet(id);
});
