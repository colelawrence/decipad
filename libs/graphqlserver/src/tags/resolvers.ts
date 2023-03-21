import {
  ID,
  GraphqlContext,
  PageInput,
  UserTaggedResourceRecord,
  PadRecord,
  Pad,
} from '@decipad/backendtypes';
import assert from 'assert';
import tables, { allPages, paginate } from '@decipad/tables';
import { subscribe } from '@decipad/services/pubsub';
import { resource } from '@decipad/backend-resources';
import { requireUser } from '../authorization';
import parseResourceUri from '../utils/resource/parse-uri';

const notebooks = resource('notebook');

const resolvers = {
  Query: {
    async tags(
      _: unknown,
      { workspaceId }: { workspaceId: ID },
      context: GraphqlContext
    ) {
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

    async padsByTag(
      _: unknown,
      {
        workspaceId,
        tag,
        page,
      }: { workspaceId: ID; tag: string; page: PageInput },
      context: GraphqlContext
    ) {
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

      return paginate<UserTaggedResourceRecord, PadRecord>(
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
    },
  },

  Mutation: {
    async addTagToPad(
      _: unknown,
      { padId, tag }: { padId: ID; tag: string },
      context: GraphqlContext
    ) {
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
    },

    async removeTagFromPad(
      _: unknown,
      { padId, tag }: { padId: ID; tag: string },
      context: GraphqlContext
    ) {
      const { resources } = await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: padId,
        minimumPermissionType: 'WRITE',
      });

      const data = await tables();
      const tagId = `${resources[0]}/tags/${encodeURIComponent(tag)}`;
      await data.tags.delete({ id: tagId });
    },
  },

  Subscription: {
    tagsChanged: {
      async subscribe(
        _: unknown,
        { workspaceId }: { workspaceId: ID },
        context: GraphqlContext
      ) {
        const user = requireUser(context);
        assert(context.subscriptionId, 'no subscriptionId in context');
        assert(context.connectionId, 'no connectionId in context');
        return subscribe({
          subscriptionId: context.subscriptionId,
          connectionId: context.connectionId,
          user,
          type: 'tagsChanged',
          filter: JSON.stringify({ workspaceId }),
        });
      },
    },
  },

  Pad: {
    async tags(pad: Pad): Promise<string[]> {
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
