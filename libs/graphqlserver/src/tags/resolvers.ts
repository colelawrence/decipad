import { UserTaggedResourceRecord, PadRecord } from '@decipad/backendtypes';
import assert from 'assert';
import tables, { allPages, paginate } from '@decipad/tables';
import { resource } from '@decipad/backend-resources';
import { requireUser } from '../authorization';
import parseResourceUri from '../utils/resource/parse-uri';
import { PagedPadResult, Resolvers } from '@decipad/graphqlserver-types';

const notebooks = resource('notebook');

const resolvers: Resolvers = {
  Query: {
    async tags(_, { workspaceId }, context) {
      const user = requireUser(context);

      const data = await tables();
      const query = {
        IndexName: 'byUserAndWorkspace',
        KeyConditionExpression:
          'user_id = :user_id and workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':workspace_id': workspaceId,
        },
      };
      const tags = [];
      for await (const tag of allPages(data.usertags, query)) {
        if (tag) {
          tags.push(tag.tag);
        }
      }

      return tags.sort();
    },

    async padsByTag(_, { workspaceId, tag, page }, context) {
      const user = requireUser(context);

      const query = {
        IndexName: 'byUserAndTag',
        KeyConditionExpression: 'user_id = :user_id and tag = :tag',
        FilterExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':tag': tag,
          ':workspace_id': workspaceId,
        },
      };

      const data = await tables();

      const paginated = await paginate<UserTaggedResourceRecord, PadRecord>(
        data.usertaggedresources,
        query,
        page,
        {
          map: async (userTaggedResource: UserTaggedResourceRecord) => {
            const parsedResource = parseResourceUri(
              userTaggedResource.resource_uri
            );
            assert.strictEqual(parsedResource.type, 'pads');
            return data.pads.get({ id: parsedResource.id });
          },
        }
      );

      /* Cast required to omit deeper graphql properties */
      return paginated as PagedPadResult;
    },
  },

  Mutation: {
    async addTagToPad(_, { padId, tag }, context) {
      const { resources } = await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: padId,
        minimumPermissionType: 'WRITE',
      });

      const data = await tables();
      const newTag = {
        id: `${resources[0]}/tags/${encodeURIComponent(tag)}`,
        tag,
        resource_uri: resources[0],
      };
      await data.tags.put(newTag);

      return true;
    },

    async removeTagFromPad(_, { padId, tag }, context) {
      const { resources } = await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: padId,
        minimumPermissionType: 'WRITE',
      });

      const data = await tables();
      const tagId = `${resources[0]}/tags/${encodeURIComponent(tag)}`;
      await data.tags.delete({ id: tagId });

      return true;
    },
  },

  Pad: {
    async tags(pad) {
      const notebookResource = `/pads/${pad.id}`;
      const data = await tables();

      const query = {
        IndexName: 'byResource',
        KeyConditionExpression: 'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': notebookResource,
        },
      };
      const tags = [];
      for await (const tag of allPages(data.tags, query)) {
        if (tag) {
          tags.push(tag.tag);
        }
      }
      return tags.sort();
    },
  },
};

export default resolvers;
