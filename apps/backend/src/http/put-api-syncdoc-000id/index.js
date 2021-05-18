const handle = require('@architect/shared/handle');
const put = require('@architect/shared/sync/put');
let NextAuthJWT = require('next-auth/jwt');

exports.handler = handle(async (event) => {
  return await put(event.pathParameters.id, event, { NextAuthJWT });
});
