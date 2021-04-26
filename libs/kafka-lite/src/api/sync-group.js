const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('../error-codes');

async function syncGroup(request) {
  const { apiVersion, reply, payload, groupManager } = request;

  const decoder = new Decoder(payload);

  // group_id => COMPACT_STRING
  //   generation_id => INT32
  //   member_id => COMPACT_STRING
  //   group_instance_id => COMPACT_NULLABLE_STRING
  //   protocol_type => COMPACT_NULLABLE_STRING
  //   protocol_name => COMPACT_NULLABLE_STRING
  //   assignments => member_id assignment TAG_BUFFER
  //     member_id => COMPACT_STRING
  //     assignment => COMPACT_BYTES

  const groupId = decoder.readString();
  const generationId = decoder.readInt32();
  const memberId = decoder.readString();
  const groupInstanceId = decoder.readString();

  const assignmentsCount = decoder.readInt32();
  const assignments = [];
  for (
    let assignmentIndex = 0;
    assignmentIndex < assignmentsCount;
    assignmentIndex++
  ) {
    assignments.push({
      memberId: decoder.readString(),
      assignment: decoder.readVarIntBytes(),
    });
  }

  const resultTopicAssignments = groupManager.sync({
    groupId,
    generationId,
    memberId,
    groupInstanceId,
    assignments,
  });

  const response = new Encoder();

  response.writeInt32(0); // throttle_time_ms
  response.writeInt16(errorCodes.NONE);

  const memberAssignmentEncoder = new Encoder();

  memberAssignmentEncoder
    .writeInt16(apiVersion)
    .writeInt32(resultTopicAssignments.size);

  for (const [topicName, assignments] of resultTopicAssignments.entries()) {
    memberAssignmentEncoder.writeString(topicName);
    memberAssignmentEncoder.writeInt32(assignments.length);
    for (const partition of assignments) {
      memberAssignmentEncoder.writeInt32(partition);
    }
  }
  memberAssignmentEncoder.writeBytes(Buffer.alloc(0));

  response.writeBytes(memberAssignmentEncoder.buffer);

  reply(response.buffer);
}

module.exports = syncGroup;
