import type { AnnotationRecord } from '@decipad/backendtypes';
import type { Resolvers } from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';

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
      const res = await data.annotations.query(query);

      const usersIds = res.Items.map((item) => item.user_id);
      const users = await data.users.batchGet(usersIds);
      const anonUsers = await data.anonusers.batchGet(usersIds);

      const annotations = res.Items.map((annotation) => {
        const user =
          users.find(({ id }) => id === annotation.user_id) ||
          anonUsers.find(({ id }) => id === annotation.user_id);

        return user
          ? {
              ...annotation,
              user: {
                id: user.id,
                username: user.name,
                avatar: user.image || undefined,
              },
            }
          : annotation;
      });

      return annotations;
    },
  },
  Mutation: {
    createAnnotation: async (
      _,
      { padId, content, blockId },
      context
    ): Promise<AnnotationRecord> => {
      const data = await tables();
      const { user } = context;

      // We don't want to allow anonymous user comments until scenarios have been enabled
      if (!user) {
        throw new Error('User not authenticated');
      }

      const annotation: AnnotationRecord = {
        id: nanoid(),
        pad_id: padId,
        content,
        block_id: blockId,
        user_id: user.id,
        dateCreated: new Date().getTime(),
      };
      await data.annotations.put(annotation);
      return annotation;
    },
    deleteAnnotation: async (_, { id }, context): Promise<AnnotationRecord> => {
      // check whether user is allowed to delete an annotation
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
        throw new Error('User not allowed to delete annotation');
      }
      await data.annotations.delete({ id });
      return annotation;
    },
  },
};

export default resolvers;
