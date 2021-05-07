const handle = require('@architect/shared/handle');
const putChanges = require('@architect/shared/sync/put-changes');
const uri = require('@architect/shared/uri');
let NextAuthJWT = require('next-auth/jwt');

exports.handler = handle(async (event) => {
  const id = uri('workspaces', event.pathParameters.workspaceid, 'pads');
  return putChanges(id, event, { NextAuthJWT });
});
