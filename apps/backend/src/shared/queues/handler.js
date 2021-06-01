'use strict';
const arc = require('@architect/functions');

function queueHandler(handler) {
  return arc.queues.subscribe(async (event) => {
    try {
      await handler(event);
    } catch (err) {
      console.error('Error handling queue:', err);
      console.error('queue event = ', JSON.stringify(event, null, '\t'));
      throw err;
    }
  });
}

module.exports = queueHandler;
