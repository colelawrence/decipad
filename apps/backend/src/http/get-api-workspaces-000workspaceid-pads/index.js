const handle = require('@architect/shared/handle')
const syncGet = require('@architect/shared/sync/get')
const uri = require('@architect/shared/uri')

exports.handler = handle(async (event) => {
  const id = uri('workspaces', event.pathParameters.workspaceid, 'pads')
  return await syncGet(id)
})