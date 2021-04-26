const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('../error-codes');

async function leaveGroup(request) {
  const { reply, payload, groupManager } = request;

  const decoder = new Decoder(payload);

  const groupId = decoder.readString();
  const memberCount = decoder.readInt32();
  const members = [];
  for (let memberIndex = 0; memberIndex < memberCount; memberIndex++) {
    members.push({
      memberId: decoder.readString(),
      groupInstanceId: decoder.readString(),
    });
  }

  const resultMembers = groupManager.leaveGroup(groupId, members);

  const response = new Encoder();

  response
    .writeInt32(0) // throttle_time_ms
    .writeInt16(errorCodes.NONE) // error_code
    .writeInt32(resultMembers.length);

  for (const member of resultMembers) {
    response
      .writeString(member.memberId)
      .writeString(member.groupInstanceId)
      .writeInt16(member.errorCode);
  }

  reply(response.buffer);
}

module.exports = leaveGroup;
