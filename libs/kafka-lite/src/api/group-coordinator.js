const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')
const errorCodes = require('../error-codes')

async function groupCoordinator (request) {
  const {
    reply,
    payload,
    conf
  } = request

  const decoder = new Decoder(payload)

  // don't need any input
  decoder.readString()
  decoder.readInt8()

  const response = new Encoder()

  response.writeInt32(0) // throttle_time_ms
  response.writeInt16(errorCodes.NONE) // error_code
  response.writeString(null) // error_message
  response.writeInt32(conf.nodeId)
  response.writeString(conf.host)
  response.writeInt32(conf.port)

  reply(response.buffer)
}

module.exports = groupCoordinator
