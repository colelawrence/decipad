const arc = require('@architect/functions');
const Automerge = require('automerge');

module.exports = async function put(id, body) {
  const tables = await arc.tables();
  let doc = await tables.syncdoc.get({ id });
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
    await tables.syncdoc.put(doc);

    // Notify room

    const collabs = await tables.collabs.query({
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
    await tables.syncdoc.put(doc);
  }

  return { ok: true };
};
