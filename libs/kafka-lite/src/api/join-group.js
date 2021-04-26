const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('../error-codes');

async function joinGroup(request) {
  const { clientId, reply, payload, groupManager, socket } = request;

  const decoder = new Decoder(payload);

  const groupId = decoder.readString();
  const sessionTimeoutMs = decoder.readInt32();
  const rebalanceTimeoutMs = decoder.readInt32();
  const memberId = decoder.readString();
  const groupInstanceId = decoder.readString();
  const protocolType = decoder.readString();

  const protocolCount = decoder.readInt32();
  const protocols = [];
  for (let protocolIndex = 0; protocolIndex < protocolCount; protocolIndex++) {
    protocols.push({
      name: decoder.readString(),
      metadata: decoder.readVarIntBytes(),
    });
  }

  const result = groupManager.joinGroup({
    clientId,
    groupId,
    sessionTimeoutMs,
    rebalanceTimeoutMs,
    memberId,
    groupInstanceId,
    protocolType,
    protocols,
    socket,
  });

  const response = new Encoder();

  response.writeInt32(0); // throttle_time_ms
  response.writeInt16(errorCodes.NONE); // error_code
  response.writeInt32(1); // generation_id
  response.writeString(result.protocolName);
  response.writeString(result.leader);
  response.writeString(result.memberId);

  const members = result.members;
  response.writeInt32(members.length);
  for (const member of members) {
    response.writeString(member.id);
    response.writeString(member.groupInstanceId);
    response.writeBytes(member.metadata);
  }

  reply(response.buffer);
}

module.exports = joinGroup;
