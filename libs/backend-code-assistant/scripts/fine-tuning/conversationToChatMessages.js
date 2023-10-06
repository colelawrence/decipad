const reverseRole = (role) => {
  if (role === 'assistant') {
    return 'user';
  }
  return 'assistant';
};

const mapMessage = (message) => ({
  role: reverseRole(message.author.role),
  content: message.content.parts.join('\n'),
});

exports.conversationToChatMessages = (conversation) => {
  let nodeId = conversation.current_node;
  const messages = [];
  while (nodeId) {
    const mapping = conversation.mapping[nodeId];
    if (!mapping) {
      throw new Error(`Could not find message ${nodeId}`);
    }
    if (mapping.message) {
      messages.push(mapMessage(mapping.message));
    }
    nodeId = mapping.parent;
  }
  return messages.reverse();
};
