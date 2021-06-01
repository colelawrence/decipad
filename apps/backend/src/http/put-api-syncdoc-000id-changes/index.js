const handle = require('@architect/shared/handle');
let NextAuthJWT = require('next-auth/jwt');
const arc = require('@architect/functions');
const Automerge = require('automerge');
const tables = require('@architect/shared/tables');
const auth = require('@architect/shared/auth');
const { decode } = require('@architect/shared/resource');

exports.handler = handle(async (event) => {
  const id = decode(event.pathParameters.id);
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
    return {
      statusCode: 404,
    };
  }
  const before = Automerge.load(doc.latest);

  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;
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
});
