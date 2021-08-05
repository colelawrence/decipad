import { GraphqlContext } from '@decipad/backendtypes';
import { requireUser } from '../authorization';

export default {
  Subscription: {
    hello: {
      subscribe() {
        return {
          async *[Symbol.asyncIterator]() {
            yield 'Hello World!';
          },
        };
      },
      resolve(_: unknown, __: unknown, context: GraphqlContext) {
        requireUser(context);
        return 'Hello World!';
      },
    },
  },
};
