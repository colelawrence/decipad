const handle = require('@architect/shared/handle');
const put = require('@architect/shared/sync/put');
const uri = require('@architect/shared/uri');
let NextAuthJWT = require('next-auth/jwt');

exports.handler = handle(async (event) => {
  const id = uri('workspaces', event.pathParameters.workspaceid);
  return put(id, event, { NextAuthJWT });
});
