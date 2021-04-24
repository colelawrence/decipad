const arc = require('@architect/functions')
const Automerge = require('automerge')

module.exports = async function putChanges(id, body) {
  const tables = await arc.tables()
  let doc = await tables.syncdoc.get({ id })

  if (!doc) {
    return {
      statusCode: 404
    }
  }
  const before = Automerge.load(doc.latest)
  const changes = JSON.parse(body)
  if (changes.length > 0) {
    const after = Automerge.applyChanges(before, changes)
    doc.latest = Automerge.save(after)

    await tables.syncdoc.put(doc)

    // Notify room

    const collabs = await tables.collabs.query({
      IndexName: 'room-index',
      KeyConditionExpression: 'room = :room',
      ExpressionAttributeValues: {
        ':room': id
      }
    })

    for (const collab of collabs.Items) {
      try {
        await arc.ws.send({
          id: collab.conn,
          payload: { 'o': 'c', t: id, 'c': changes }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  return { ok: true }
}
