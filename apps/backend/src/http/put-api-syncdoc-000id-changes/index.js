const handle = require('@architect/shared/handle');
const putChanges = require('@architect/shared/sync/put-changes');
let NextAuthJWT = require('next-auth/jwt');

exports.handler = handle(async (event) => {
  return putChanges(event.pathParameters.id, event, { NextAuthJWT });
});
