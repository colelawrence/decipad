const handle = require('@architect/shared/handle');
const NextAuthJWT = require('next-auth/jwt');
const tables = require('@architect/shared/tables');
const auth = require('@architect/shared/auth');
const { isAuthorized } = require('@architect/shared/authorization');

exports.handler = handle(async (event) => {
  const { user } = await auth(event, { NextAuthJWT });

  const id = event.pathParameters.id;
  if (!user || !(await isAuthorized(id, user, 'WRITE'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();
  let doc = await data.syncdoc.get({ id });
  if (!doc) {
    return null;
  }
  return doc.latest;
});
