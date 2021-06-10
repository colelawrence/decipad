import { AuthenticationError } from 'apollo-server-lambda';
import tables from '../../tables';
import { requireUser } from '../authorization';

export default {
  Query: {
    self(_: any, _args: any, context: GraphqlContext) {
      return context.user;
    },
  },

  Mutation: {
    async updateSelf(_: any, { props }: { props: Partial<UserInput> }, context: GraphqlContext): Promise<User> {
      const user = requireUser(context);

      const data = await tables();

      const self = await data.users.get({ id: user.id });
      if (!self) {
        throw new AuthenticationError('Not authenticated');
      }

      Object.assign(self, props, { id: user.id });

      await data.users.put(self);

      return self;
    },
  },
};
