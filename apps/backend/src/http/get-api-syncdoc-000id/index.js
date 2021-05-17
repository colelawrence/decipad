const handle = require('@architect/shared/handle');
const syncGet = require('@architect/shared/sync/get');
const NextAuthJWT = require('next-auth/jwt');

exports.handler = handle(async (event) => {
  return await syncGet(event.pathParameters.id, event, { NextAuthJWT });
});
