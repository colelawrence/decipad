import { nanoid } from 'nanoid';
import md5 from 'md5';
import { resource } from '@decipad/backend-resources';
import type {
  Annotation,
  PadAlias,
  Resolvers,
} from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';

const notebooks = resource('notebook');

const isValidAnnotation = (annotation: Annotation): boolean =>
  annotation.type != null;

const resolvers: Resolvers = {
  Query: {
    getAnnotationsByPadId: async (_, { padId }, context) => {
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
      const annotations = await data.annotations.query(query);

      return annotations.Items.filter(isValidAnnotation);
    },
  },
  Mutation: {
    createAnnotation: async (
      _,
      { padId, aliasId, content, type, meta, blockId },
      context
    ) => {
      const data = await tables();
      const { user } = context;

      const annotation = {
        id: nanoid(),
        type,
        pad_id: padId,
        alias_id: aliasId,

        content,
        block_id: blockId,
        meta: meta ?? '',
        user_id: user?.id ?? '',
        dateCreated: new Date().getTime(),
      };
      await data.annotations.put(annotation);
      return annotation;
    },
    deleteAnnotation: async (_, { id }, context) => {
      const { user } = context;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const data = await tables();
      const annotation = await data.annotations.get({ id });

      if (!annotation) {
        throw new Error('Annotation not found');
      }

      if (annotation.user_id !== user.id) {
        const padId = annotation.pad_id;

        // only allow admins to delete annotations from other users
        await notebooks.expectAuthorizedForGraphql({
          context,
          recordId: padId,
          minimumPermissionType: 'ADMIN',
        });
      }

      await data.annotations.delete({ id });

      return annotation as Annotation;
    },
  },
  Annotation: {
    user: async (annotation) => {
      if (!annotation.user_id) {
        return null;
      }

      const data = await tables();
      const user = await data.users.get({ id: annotation.user_id });
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        username: user.name,
        avatar:
          user.image ||
          (user.email && md5(user.email, { encoding: 'binary' })) ||
          undefined,
      };
    },
    alias: async (annotation) => {
      if (!annotation.alias_id) {
        return undefined;
      }
      const data = await tables();
      const alias = await data.aliases.get({ id: annotation.alias_id });
      if (!alias) {
        return null;
      }
      return {
        id: alias.id,
        alias: alias.alias,
        pad_id: alias.pad_id,
      } as PadAlias;
    },
  },
};

export default resolvers;
