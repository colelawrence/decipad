import { identify, track } from '@decipad/backend-analytics';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import { loadUser, requireUser } from '../authorization';
import { forbiddenUsernamePrefixes } from './forbiddenUsernamePrefixes';
import { Resolvers, User } from '@decipad/graphqlserver-types';

const minimumUsernameCharCount = 1;

const resolvers: Resolvers = {
  Query: {
    self(_, _args, context) {
      return context.user as User;
    },
    async selfFulfilledGoals(_, _args, context) {
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
    async updateSelf(_, { props }, context) {
      const user = requireUser(context);

      const data = await tables();

      const self = await data.users.get({ id: user.id });
      if (!self) {
        throw new AuthenticationError('Not authenticated');
      }

      if (!user.onboarded && props.onboarded) {
        await track(context.event, {
          event: 'user onboarded',
          userId: user.id,
          properties: { email: user.email },
        });
      }

      Object.assign(self, props, { id: user.id });

      await data.users.put(self);

      await identify(context.event, user.id, {
        fullName: self.name,
        email: self.email,
      });
      return self as User;
    },

    async fulfilGoal(_, { props }, context) {
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

    async setUsername(_, { props }, context) {
      const user = requireUser(context);

      let { username } = props;

      if (username.startsWith('@')) {
        username = username.replace(/^@(.*)/, '$1');
      }
      if (!username.match(/^[a-z,0-9]+$/)) {
        throw new UserInputError(
          `Username must be lower case and contain only numbers or letters`
        );
      }
      if (username.length < minimumUsernameCharCount) {
        throw new UserInputError(
          `Username must have at least ${minimumUsernameCharCount} letters or numbers`
        );
      }

      if (
        forbiddenUsernamePrefixes.some((forbiddenPrefix) =>
          username.startsWith(forbiddenPrefix)
        )
      ) {
        throw new UserInputError(`Selected username is reserved`);
      }

      const key = `username:${username}`;
      const data = await tables();

      const existingKey = await data.userkeys.get({ id: key });

      if (existingKey) {
        if (existingKey.user_id !== user.id) {
          throw new UserInputError(`Username is already in use`);
        } else {
          return true;
        }
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

export default resolvers;
