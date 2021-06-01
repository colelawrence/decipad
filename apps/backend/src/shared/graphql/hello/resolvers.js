'use strict';

const { requireUser } = require('../authorization');

const resolvers = {
  Subscription: {
    hello: {
      // subscribe(_, __, context) {
      subscribe(...args) {
        console.log('subscribe', JSON.stringify(args, null, '\t'));
        // requireUser(context);
        return {
          async *[Symbol.asyncIterator]() {
            yield 'Hello World!';
          },
        };
      },
      resolve(_, __, context) {
        requireUser(context);
        return 'Hello World!';
      },
    },
  },
};

module.exports = resolvers;
