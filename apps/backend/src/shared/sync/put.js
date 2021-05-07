const arc = require('@architect/functions');
const tables = require('../tables');
const Automerge = require('automerge');
const auth = require('../auth');

module.exports = async function put(id, event, { NextAuthJWT }) {
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
  let needsCreate = false;

  if (!doc) {
    doc = {
      id,
      latest: body,
    };
    needsCreate = true;
  }
  const before = Automerge.load(doc.latest);
  const remote = Automerge.load(body);
  const after = Automerge.merge(before, remote);
  doc.latest = Automerge.save(after);

  const changes = Automerge.getChanges(before, after);

  if (changes.length > 0) {
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
  } else if (needsCreate) {
    await data.syncdoc.put(doc);
  }

  return { ok: true };
};
