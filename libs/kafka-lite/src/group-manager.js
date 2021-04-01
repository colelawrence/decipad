'use strict';

const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const serverError = require('./server-error');
const errorCodes = require('./error-codes');
const createQueue = require('./utils/fn-queue');

async function createGroupManager(log, conf) {
  const groupsById = new Map();
  const assignmentsByGroupId = new Map();
  const offsetsByGroupId = (await readGroupOffsets()) || new Map();
  const queue = createQueue();

  function joinGroup(req) {
    const { groupId, memberId, groupInstanceId, protocols, socket } = req;

    let group = groupsById.get(groupId);
    if (!group) {
      group = {
        id: groupId,
        members: [],
        leader: undefined,
        protocolName: undefined,
        rebalanceInProgress: false,
        missingSyncs: [],
      };
      groupsById.set(groupId, group);
    }

    group.rebalanceInProgress = true;

    const effectiveMemberId = memberId || createMemberId();

    group.members.push({
      id: effectiveMemberId,
      groupInstanceId,
      metadata: protocols.length ? protocols[0].metadata : Buffer.alloc(0),
    });

    if (!group.leader) {
      group.leader = effectiveMemberId;
    }

    assignPartitions(group);

    socket.once('close', () => {
      try {
        leaveGroup(groupId, [{ memberId: effectiveMemberId }]);
      } catch (err) {
        // ignore
      }
    });

    return {
      protocolName: 'RoundRobinAssigner', // string
      leader: effectiveMemberId, // string
      memberId: effectiveMemberId,
      members: group.members,
    };

    function createMemberId() {
      return `${groupId}-member-${group.members.length}`;
    }
  }

  function assignPartitions(group) {
    const topics = log.topics();
    const members = group.members;
    const assignmenstByMemberId = new Map();
    let memberIndex = -1;
    for (const topic of topics) {
      for (let partition = 0; partition < topic.numPartitions; partition++) {
        memberIndex = (memberIndex + 1) % members.length;
        const member = members[memberIndex];
        const memberId = member.id;
        let memberAssignments = assignmenstByMemberId.get(memberId);
        if (!memberAssignments) {
          memberAssignments = new Map();
          assignmenstByMemberId.set(memberId, memberAssignments);
        }

        let topicMemberAssignments = memberAssignments.get(topic.name);
        if (!topicMemberAssignments) {
          topicMemberAssignments = [];
          memberAssignments.set(topic.name, topicMemberAssignments);
        }
        topicMemberAssignments.push(partition);
      }
    }

    group.rebalanceInProgress = true;
    group.missingSyncs = group.members.map((member) => member.id);

    assignmentsByGroupId.set(group.id, assignmenstByMemberId);
  }

  function assignPartitionsForAllGroups() {
    for (let group of groupsById.values()) {
      assignPartitions(group);
    }
  }

  function sync(req) {
    const { groupId, memberId } = req;

    const group = groupsById.get(groupId);
    if (!group) {
      throw serverError(
        `could not find group with id ${groupId}`,
        errorCodes.INVALID_GROUP_ID
      );
    }

    const assignmentResultsForGroup = assignmentsByGroupId.get(groupId);

    const memberIndexInMissingSyncs = group.missingSyncs.indexOf(memberId);
    if (memberIndexInMissingSyncs >= 0) {
      group.missingSyncs.splice(memberIndexInMissingSyncs, 1);
    }
    if (group.missingSyncs.length === 0) {
      group.rebalanceInProgress = false;
    }

    return assignmentResultsForGroup.get(memberId) || new Map();
  }

  async function offsetFetch(groupId, topics) {
    const reply = {};

    const storedOffsetsForGroup = offsetsByGroupId.get(groupId);
    for (const [topicName, partitionIndexes] of Object.entries(topics)) {
      const storedOffsetsForTopic =
        storedOffsetsForGroup && storedOffsetsForGroup.get(topicName);
      reply[topicName] = partitionIndexes.map((partitionIndex) => ({
        partitionIndex,
        committedOffset:
          (storedOffsetsForTopic && storedOffsetsForTopic[partitionIndex]) ||
          0n,
      }));
    }

    return reply;
  }

  async function offsetCommit(groupId, topics) {
    const reply = {};

    let storedOffsetsForGroup = offsetsByGroupId.get(groupId);
    if (!storedOffsetsForGroup) {
      storedOffsetsForGroup = new Map();
      offsetsByGroupId.set(groupId, storedOffsetsForGroup);
    }
    for (const [topicName, partitions] of Object.entries(topics)) {
      let topicPartitionOffsets = storedOffsetsForGroup.get(topicName);
      if (!topicPartitionOffsets) {
        topicPartitionOffsets = [];
        storedOffsetsForGroup.set(topicName, topicPartitionOffsets);
      }
      const partitionsReply = [];
      for (const partition of partitions) {
        const { partitionIndex, committedOffset } = partition;
        topicPartitionOffsets[partitionIndex] = committedOffset;

        partitionsReply.push({
          partitionIndex,
          errorCode: errorCodes.NONE,
        });
      }

      reply[topicName] = partitionsReply;
    }

    await saveGroupOffsets();

    return reply;
  }

  function isRebalanceInProgressForGroup(groupId, memberId) {
    const group = groupsById.get(groupId);
    if (!group) {
      return false;
    }

    if (
      group.rebalanceInProgress &&
      group.missingSyncs.indexOf(memberId) >= 0
    ) {
      return true;
    }
    return false;
  }

  function leaveGroup(groupId, members) {
    const reply = [];
    const group = groupsById.get(groupId);
    if (!group) {
      throw serverError(
        `Unknown group id ${groupId}`,
        errorCodes.INVALID_GROUP_ID
      );
    }

    for (const member of members) {
      const { memberId } = member;
      const memberIndex = group.members.findIndex(
        (member) => member.id === memberId
      );
      if (memberIndex < 0) {
        throw serverError(
          `Unknown member id ${memberId} for group ${groupId}`,
          errorCodes.UNKNOWN_MEMBER_ID
        );
      }

      group.members.splice(memberIndex, 1);
      reply.push({
        memberId,
        groupInstanceId: null, // TODO
        errorCode: errorCodes.NONE,
      });
    }

    group.rebalanceInProgress = true;
    group.missingSyncs = group.members.map((member) => member.id);

    return reply;
  }

  log.events.on('topics changed', () => {
    assignPartitionsForAllGroups();
  });

  function saveGroupOffsets() {
    return queue.push(() => {
      const file = path.join(conf.dataDir, 'groups.json');
      const saving = Array.from(
        offsetsByGroupId.entries()
      ).map(([groupId, offsets]) => [
        groupId,
        Array.from(offsets.entries()).map(([topicName, offsets]) => [
          topicName,
          offsets.map((offset) => offset.toString()),
        ]),
      ]);

      return writeFile(file, JSON.stringify(saving));
    });
  }

  async function readGroupOffsets() {
    const file = path.join(conf.dataDir, 'groups.json');
    try {
      const contents = JSON.parse(await readFile(file, { encoding: 'utf8' }));
      const groupOffsets = new Map(
        contents.map(([groupId, offsets]) => [
          groupId,
          new Map(
            offsets.map(([topic, offsets]) => [
              topic,
              offsets.map((offset) => (offset && BigInt(offset)) || 0n),
            ])
          ),
        ])
      );
      return groupOffsets;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  return {
    joinGroup,
    sync,
    offsetFetch,
    offsetCommit,
    isRebalanceInProgressForGroup,
    leaveGroup,
  };
}

module.exports = createGroupManager;
