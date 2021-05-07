const arc = require('@architect/functions');
const tables = require('../tables');
const Automerge = require('automerge');
const auth = require('../auth');

module.exports = async function putChanges(id, event, { NextAuthJWT }) {
  if (typeof NextAuthJWT.encode !== 'function') {
    NextAuthJWT = NextAuthJWT.default;
  }

  const { user } = await auth(event, { NextAuthJWT });
  if (!user) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  let body;
  if (event.isBase64Encoded) {
    body = Buffer.from(event.body, 'base64').toString();
  } else {
    body = event.body;
  }

  const data = await tables();
  let doc = await data.syncdoc.get({ id });

  if (!doc) {
    return {
      statusCode: 404,
    };
  }
  const before = Automerge.load(doc.latest);

  const changes = JSON.parse(body);
  if (changes.length > 0) {
    const after = Automerge.applyChanges(before, changes);
    doc.latest = Automerge.save(after);

    await data.syncdoc.put(doc);

    // Notify room

    const collabs = await data.collabs.query({
      IndexName: 'room-index',
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': id,
      },
    });

    for (const collab of collabs.Items) {
      try {
        await arc.ws.send({
          id: collab.conn,
          payload: { o: 'c', t: id, c: changes },
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  return { ok: true };
};
