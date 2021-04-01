'use strict'

const assert = require('assert')
const apiKeys = require('./api-keys')
const errorCodes = require('./error-codes')
const apiVersionSupport = require('./api-versions-support')

async function processRequest (request) {
  const {
    apiKey,
    apiVersion,
    error
  } = request

  const versionSupport = apiVersionSupport[apiKey]
  if (!versionSupport) {
    return error(errorCodes.INVALID_REQUEST)
  }

  if ((apiVersion > versionSupport.max) || (apiVersion < versionSupport.min)) {
    return error(errorCodes.UNSUPPORTED_VERSION)
  }

  const api = apiKeys[apiKey]

  assert(api)

  try {
    await api(request)
  } catch (err) {
    console.error('ERROR EXECUTING API REQUEST', err)
    request.error(err)
  }
}

module.exports = processRequest
