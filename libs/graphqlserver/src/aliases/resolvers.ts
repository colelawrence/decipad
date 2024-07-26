import tables from '@decipad/tables';

import { UserInputError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import type {
  MutationResolvers,
  Resolvers,
} from '@decipad/graphqlserver-types';
import { nanoid } from 'nanoid';

const notebooks = resource('notebook');

const addAlias: MutationResolvers['addAlias'] = async (
  _,
  { alias, padId },
  context
) => {
  const { user } = await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: padId,
    minimumPermissionType: 'ADMIN',
  });
  if (user?.banned) {
    throw new UserInputError('User is banned');
  }
  const data = await tables();

  const aliasRecord = {
    id: nanoid(),
    pad_id: padId,
    alias,
  };

  await data.aliases.put(aliasRecord);

  return aliasRecord;
};

const removeAlias: MutationResolvers['removeAlias'] = async (
  _,
  { id: aliasId },
  context
) => {
  const data = await tables();

  const alias = await data.aliases.get({ id: aliasId });

  if (!alias) {
    throw new UserInputError('Alias not found');
  }

  const { user } = await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: alias.pad_id,
    minimumPermissionType: 'ADMIN',
  });

  if (user?.banned) {
    throw new UserInputError('User is banned');
  }

  await data.aliases.delete({ id: aliasId });

  return true;
};

const recordPadEvent: MutationResolvers['recordPadEvent'] = async (
  _,
  { padId, aliasId, name, meta }
) => {
  const data = await tables();

  const pad = await data.pads.get({ id: padId });

  if (!pad) {
    throw new UserInputError('Pad not found');
  }

  await data.padevents.put({
    id: nanoid(),
    pad_id: padId,
    alias_id: aliasId,
    name,
    meta: meta ?? '',
    created_at: new Date().getTime(),
  });

  return true;
};

const resolvers: Resolvers = {
  Query: {
    getAliasesByPadId: async (_, { padId }, context) => {
      if (!context.user) {
        return [];
      }
      const data = await tables();

      const query = {
        IndexName: 'byPadId',
        KeyConditionExpression: 'pad_id = :padId',
        ExpressionAttributeValues: {
          ':padId': padId,
        },
      };
      const aliases = await data.aliases.query(query);

      return aliases.Items;
    },
  },
  Mutation: {
    addAlias,
    removeAlias,
    recordPadEvent,
  },
  PadAlias: {
    annotations: async (alias) => {
      const data = await tables();
      const query = {
        IndexName: 'byAliasId',
        KeyConditionExpression: 'alias_id = :aliasId',
        ExpressionAttributeValues: {
          ':aliasId': alias.id,
        },
      };
      const annotations = await data.annotations.query(query);

      return annotations.Items;
    },
    events: async (alias) => {
      const data = await tables();
      const query = {
        IndexName: 'byAliasId',
        KeyConditionExpression: 'alias_id = :aliasId',
        ExpressionAttributeValues: {
          ':aliasId': alias.id,
        },
      };
      const events = await data.padevents.query(query);

      return events.Items;
    },
  },
};

export default resolvers;
