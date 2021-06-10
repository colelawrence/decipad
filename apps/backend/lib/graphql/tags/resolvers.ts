import assert from 'assert';
import tables from '../../tables';
import { requireUser, check } from '../authorization';
import paginate from '../utils/paginate';
import parseResourceUri from '../../utils/parse-resource-uri';
import allPages from '../../tables/all-pages';
import { subscribe } from '../../pubsub';

const resolvers = {
  Query: {
    async tags(_: any, { workspaceId }: { workspaceId: ID }, context: GraphqlContext) {
      const user = await requireUser(context);

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
        tags.push(tag.tag);
      }

      return tags.sort();
    },

    async padsByTag(_: any, { workspaceId, tag, page }: { workspaceId: ID, tag: string, page: PageInput }, context: GraphqlContext) {
      const user = await requireUser(context);

      const query = {
        IndexName: 'byUserAndTag',
        KeyConditionExpression:
          'user_id = :user_id and tag = :tag',
        FilterExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':user_id': user.id,
          ':tag': tag,
          ':workspace_id': workspaceId,
        },
      };

      const data = await tables();

      return await paginate<UserTaggedResourceRecord, PadRecord>(
        data.usertaggedresources,
        query,
        page,
        async (userTaggedResource: UserTaggedResourceRecord) => {
          const resource = parseResourceUri(userTaggedResource.resource_uri);
          assert.equal(resource.type, 'pads');
          return data.pads.get({ id: resource.id });
        }
      );
    }
  },

  Mutation: {
    async addTagToPad(_: any, { padId, tag }: { padId: ID, tag: string}, context: GraphqlContext) {
      const resource = `/pads/${padId}`;
      await check(resource, context, 'WRITE');

      const data = await tables();
      const newTag = {
        id: `${resource}/tags/${encodeURIComponent(tag)}`,
        tag,
        resource_uri: resource,
      };
      await data.tags.put(newTag);
    },

    async removeTagFromPad(_: any, { padId, tag }: { padId: ID, tag: string}, context: GraphqlContext) {
      const resource = `/pads/${padId}`;
      await check(resource, context, 'WRITE');

      const data = await tables();
      const tagId = `${resource}/tags/${encodeURIComponent(tag)}`;
      await data.tags.delete({ id: tagId });
    }
  },

  Subscription: {
    tagsChanged: {
      async subscribe(_: any, { workspaceId }: {workspaceId: ID}, context: GraphqlContext) {
        const user = requireUser(context);
        assert(context.subscriptionId, 'no subscriptionId in context');
        assert(context.connectionId, 'no connectionId in context');
        return await subscribe({
          subscriptionId: context.subscriptionId!,
          connectionId: context.connectionId!,
          user,
          type: 'tagsChanged',
          filter: JSON.stringify({ workspaceId: workspaceId }),
        });
      },
    },
  },

  Pad: {
    async tags(pad: Pad): Promise<string[]> {
      const resource = `/pads/${pad.id}`;
      const data = await tables();

      const query = {
        IndexName: 'byResource',
        KeyConditionExpression:
          'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': resource,
        },
      };
      const tags = []
      for await (const tag of allPages(data.tags, query)) {
        tags.push(tag.tag);
      }
      return tags.sort();
    },
  },
};

export default resolvers;
