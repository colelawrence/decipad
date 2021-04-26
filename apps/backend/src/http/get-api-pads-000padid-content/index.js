const handle = require('@architect/shared/handle');
const syncGet = require('@architect/shared/sync/get');
const uri = require('@architect/shared/uri');

exports.handler = handle(async (event) => {
  const id = uri('pads', event.pathParameters.padid, 'content');
  return await syncGet(id);
});
