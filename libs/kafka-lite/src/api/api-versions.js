const Encoder = require('kafkajs/src/protocol/encoder')
const errorCodes = require('../error-codes')
const apiVersionsSupport = require('../api-versions-support')

async function apiVersions (request) {
  const {
    reply
  } = request

  const apiVersions = Array.from(Object.entries(apiVersionsSupport))

  const encoder = new Encoder()

  encoder.writeInt16(errorCodes.NONE)

  encoder.writeInt32(apiVersions.length)
  for (const [apiKey, versions] of apiVersions) {
    encoder.writeInt16(apiKey) // min_version
    encoder.writeInt16(versions.min) // min_version
    encoder.writeInt16(versions.max) // max_version
  }
  encoder.writeInt32(0) // throttle_time_ms

  reply(encoder.buffer)
}

module.exports = apiVersions
