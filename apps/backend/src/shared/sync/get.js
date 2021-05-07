const tables = require('../tables');
const auth = require('../auth');

module.exports = async function get(id, event, { NextAuthJWT }) {
  const { user } = await auth(event, { NextAuthJWT });

  if (!user) {
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
};
