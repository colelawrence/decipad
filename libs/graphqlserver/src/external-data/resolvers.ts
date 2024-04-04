import tables from '@decipad/tables';
import type { Resolvers } from '@decipad/graphqlserver-types';
import { getDefined } from '@decipad/utils';
import {
  authUrlFor,
  dataUrlFor,
  externalDataResource,
} from './externalDataResource';
import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import { nanoid } from 'nanoid';
import type { ExternalDataSourceDataLinks } from '@decipad/backendtypes';

const notebooks = resource('notebook');
const workspaces = resource('workspace');

const resolvers: Resolvers = {
  Query: {
    async getExternalDataSource(pad, input, context) {
      return getDefined(
        await externalDataResource.getById(pad, input, context)
      );
    },
    getExternalDataSources: async (_, { notebookId }, context) => {
      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: notebookId,
        minimumPermissionType: 'READ',
      });
      const data = await tables();

      const { Items } = await data.externaldatasources.query({
        IndexName: 'byPadId',
        KeyConditionExpression: 'padId = :padId',
        ExpressionAttributeValues: {
          ':padId': notebookId,
        },
      });

      return Items.filter((d) => !d.isProcessing).map(
        externalDataResource.toGraphql
      );
    },
    getExternalDataSourcesWorkspace: async (_, { workspaceId }, context) => {
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: workspaceId,
        minimumPermissionType: 'READ',
      });

      const data = await tables();

      const { Items } = await data.externaldatasources.query({
        IndexName: 'byWorkspace',
        KeyConditionExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':workspace_id': workspaceId,
        },
      });

      return Items.filter((d) => !d.isProcessing).map(
        externalDataResource.toGraphql
      );
    },
  },

  Mutation: {
    async createExternalDataSource(_, { dataSource }, context) {
      //
      // Ideally, we would have a union type on the input.
      //
      // But Graphql doesnt support input unions :(
      // @link https://github.com/graphql/graphql-spec/issues/488
      //

      if (dataSource.padId == null && dataSource.workspaceId == null) {
        throw Boom.badRequest('padId OR workspaceId must be defined');
      }

      if (dataSource.padId != null && dataSource.workspaceId != null) {
        throw Boom.badRequest(
          'You must only provide a padId OR a workspaceID, not both'
        );
      }

      return externalDataResource.create(
        _,
        { ...dataSource, isProcessing: true },
        context
      );
    },

    async createExternalDataLink(_, { externalDataId, name, url, method }) {
      const data = await tables();

      const externalDataSource = await data.externaldatasources.get({
        id: externalDataId,
      });
      if (externalDataSource == null) {
        throw Boom.badRequest('ExternalData does not exist with this ID');
      }

      const dataLink: ExternalDataSourceDataLinks = {
        id: nanoid(),
        resource_uri: externalDataId,
        name,
        url,
        method,
      };

      await data.externaldatasourcedatalinks.put(dataLink);

      return dataLink;
    },
    updateExternalDataSource: externalDataResource.update,
    removeExternalDataSource: externalDataResource.remove,
    shareExternalDataSourceWithUser: externalDataResource.shareWithUser,
    unshareExternalDataSourceWithUser: externalDataResource.unshareWithUser,
    shareExternalDataSourceWithRole: externalDataResource.shareWithRole,
    unshareExternalDataSourceWithRole: externalDataResource.unshareWithRole,
    shareExternalDataSourceWithEmail: externalDataResource.shareWithEmail,
  },

  ExternalDataSource: {
    access: externalDataResource.access,
    keys: async (externalDataSource) => {
      const data = await tables();

      return (
        await data.externaldatasourcekeys.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': externalDataSource.id,
          },
        })
      ).Items;
    },
    dataUrl: (d) => dataUrlFor(d),
    authUrl: (d) => authUrlFor(d),

    async dataLinks(externalData) {
      const data = await tables();

      return data.externaldatasourcedatalinks
        .query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':resource_uri': externalData.id,
          },
        })
        .then((r) => r.Items);
    },
  },
};

export default resolvers;
