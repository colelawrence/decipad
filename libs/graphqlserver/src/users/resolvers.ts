import { AuthenticationError } from 'apollo-server-lambda';
import {
  UserInput,
  User,
  GraphqlContext,
  GoalFulfilmentInput,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { identify } from '@decipad/backend-analytics';
import { loadUser, requireUser } from '../authorization';
import timestamp from '../utils/timestamp';

export default {
  Query: {
    self(_: unknown, _args: unknown, context: GraphqlContext) {
      return context.user;
    },
    async selfFulfilledGoals(
      _: unknown,
      _args: unknown,
      context: GraphqlContext
    ): Promise<string[]> {
      const user = loadUser(context);
      if (!user) {
        return [];
      }
      const data = await tables();
      const result = await data.usergoals.query({
        IndexName: 'byUserId',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': user.id,
        },
      });

      return result.Items.map((goal) => goal.goalName);
    },
  },

  Mutation: {
    async updateSelf(
      _: unknown,
      { props }: { props: Partial<UserInput> },
      context: GraphqlContext
    ): Promise<User> {
      const user = requireUser(context);

      const data = await tables();

      const self = await data.users.get({ id: user.id });
      if (!self) {
        throw new AuthenticationError('Not authenticated');
      }

      Object.assign(self, props, { id: user.id });

      await data.users.put(self);

      await identify(user.id, { fullName: self.name, email: self.email });
      return self;
    },

    async fulfilGoal(
      _: unknown,
      { props }: { props: GoalFulfilmentInput },
      context: GraphqlContext
    ): Promise<boolean> {
      const user = requireUser(context);

      const data = await tables();

      const goalId = `/users/${user.id}/goals/${props.goalName}`;

      const fulfilled = await data.usergoals.get({ id: goalId });
      if (!fulfilled) {
        await data.usergoals.create({
          id: goalId,
          user_id: user.id,
          goalName: props.goalName,
          fulfilledAt: timestamp(),
        });
        return false;
      }
      return true;
    },
  },
};
