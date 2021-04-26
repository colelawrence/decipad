const handle = require('@architect/shared/handle');
const put = require('@architect/shared/sync/put');
const uri = require('@architect/shared/uri');

exports.handler = handle(async (event) => {
  const id = uri('workspaces');
  let body;
  if (event.isBase64Encoded) {
    body = Buffer.from(event.body, 'base64').toString();
  } else {
    body = event.body;
  }
  return put(id, body);
});
