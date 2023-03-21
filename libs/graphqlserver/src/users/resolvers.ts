import { identify } from '@decipad/backend-analytics';
import {
  GoalFulfilmentInput,
  GraphqlContext,
  SetUsernameInput,
  User,
  UserInput,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import Boom from '@hapi/boom';
import { AuthenticationError } from 'apollo-server-lambda';
import { loadUser, requireUser } from '../authorization';
import { forbiddenUsernamePrefixes } from './forbiddenUsernamePrefixes';

const minimumUsernameCharCount = 1;

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

    async setUsername(
      _: unknown,
      { props }: { props: SetUsernameInput },
      context: GraphqlContext
    ): Promise<boolean> {
      const user = requireUser(context);

      let { username } = props;

      if (username.startsWith('@')) {
        username = username.replace(/^@(.*)/, '$1');
      }
      if (!username.match(/^[a-z,0-9]+$/)) {
        throw Boom.notAcceptable(
          `Username must be lower case and contain only numbers or letters`
        );
      }
      if (username.length < minimumUsernameCharCount) {
        throw Boom.notAcceptable(
          `Username must have at least ${minimumUsernameCharCount} letters or numbers`
        );
      }

      if (
        forbiddenUsernamePrefixes.some((forbiddenPrefix) =>
          username.startsWith(forbiddenPrefix)
        )
      ) {
        throw Boom.notAcceptable(`Selected username is reserved`);
      }

      const key = `username:${username}`;
      const data = await tables();

      const existingKey = await data.userkeys.get({ id: key });
      if (existingKey) {
        return existingKey.user_id === user.id;
      }
      await data.userkeys.put({
        id: key,
        user_id: user.id,
        createdAt: timestamp(),
      });

      return true;
    },
  },
};
