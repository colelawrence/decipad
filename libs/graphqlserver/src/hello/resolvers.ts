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
      resolve(_: any, __: any, context: GraphqlContext) {
        requireUser(context);
        return 'Hello World!';
      },
    },
  },
};
