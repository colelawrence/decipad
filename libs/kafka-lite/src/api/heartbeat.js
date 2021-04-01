const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')
const errorCodes = require('../error-codes')

async function heartbeat (request) {
  const {
    reply,
    payload,
    groupManager
  } = request

  const decoder = new Decoder(payload)

  const groupId = decoder.readString()
  decoder.readInt32() // generationId
  const memberId = decoder.readString()
  // const groupInstanceId = decoder.readString()

  const response = new Encoder()

  response.writeInt32(0) // throttle_time_ms

  const errorCode = groupManager.isRebalanceInProgressForGroup(groupId, memberId)
    ? errorCodes.REBALANCE_IN_PROGRESS
    : errorCodes.NONE

  if (errorCode === errorCodes.REBALANCE_IN_PROGRESS) {
    console.log('HEARTBEAT: REBALANCE IN PROGRESS')
  }

  response.writeInt16(errorCode) // error_code

  reply(response.buffer)
}

module.exports = heartbeat
