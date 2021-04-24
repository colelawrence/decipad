const handle = require('@architect/shared/handle')
const putChanges = require('@architect/shared/sync/put-changes')
const uri = require('@architect/shared/uri')

exports.handler = handle(async (event) => {
  const id = uri('workspaces')
  let body
  if (event.isBase64Encoded) {
    body = Buffer.from(event.body, 'base64').toString()
  } else {
    body = event.body
  }
  return putChanges(id, body)
})