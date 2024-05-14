import tables, { timestamp } from '@decipad/tables';
import type { Resolvers } from '@decipad/graphqlserver-types';
import { getDefined } from '@decipad/utils';
import {
  authUrlFor,
  dataUrlFor,
  externalDataResource,
} from './externalDataResource';
import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import {
  provider as externalDataProvider,
  saveExternalKey,
} from '@decipad/externaldata';

const notebooks = resource('notebook');
const workspaces = resource('workspace');

/**
 * Use this when you are creating a connection but don't yet know the name
 * We do this when using OAuth, because we must create the external data before.
 * And only then update the name
 */
const TEMP_CONNECTION_NAME = 'TEMP_CONNECTION';

const FIVE_MINUTES = 5 * 60;

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

      return Items.filter((i) => i.name !== TEMP_CONNECTION_NAME).map(
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

      return Items.filter((i) => i.name !== TEMP_CONNECTION_NAME).map(
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

      if (dataSource.name === TEMP_CONNECTION_NAME) {
        return externalDataResource.create(
          _,
          { ...dataSource, expires_at: timestamp() + FIVE_MINUTES },
          context
        );
      }

      return externalDataResource.create(_, dataSource, context);
    },

    updateExternalDataSource: externalDataResource.update,
    removeExternalDataSource: externalDataResource.remove,
    shareExternalDataSourceWithUser: externalDataResource.shareWithUser,
    unshareExternalDataSourceWithUser: externalDataResource.unshareWithUser,
    shareExternalDataSourceWithRole: externalDataResource.shareWithRole,
    unshareExternalDataSourceWithRole: externalDataResource.unshareWithRole,
    shareExternalDataSourceWithEmail: externalDataResource.shareWithEmail,

    async refreshExternalDataToken(_, { id }, context) {
      const data = await tables();
      const externalData = await data.externaldatasources.get({ id });
      if (externalData == null) {
        throw Boom.badRequest(`External data with ID ${id} does not exist.`);
      }

      const { Items: keys } = await data.externaldatasourcekeys.query({
        IndexName: 'byResource',
        KeyConditionExpression: 'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': id,
        },
      });

      keys.sort((a, b) => b.createdAt - a.createdAt);
      const refreshKey = keys.find((k) => k.refresh_token != null);

      if (refreshKey == null) {
        throw Boom.badRequest(
          'No refresh key found, unable to refresh access token.'
        );
      }

      const provider = externalDataProvider(externalData.provider);
      if (provider == null) {
        throw Boom.badRequest(
          `External data with ID ${id} does not have a provider.`
        );
      }

      // TODO: Refactor. Type narrowing should be done another way.
      if (provider.type !== 'gsheets') {
        throw Boom.badRequest('cant refresh this.');
      }

      const { scope, accessToken, expiresIn, tokenType } =
        await provider.refreshAccessToken(refreshKey.refresh_token!);

      // TODO: Refactor to go into own provider
      await saveExternalKey({
        externalDataSource: externalData,
        userId: context.user!.id,
        tokenType,
        scope,
        accessToken,
        expiresIn,
      });

      return accessToken;
    },
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
      ).Items.map((i) => ({
        ...i,
        access: i.access_token,
        createdAt: i.createdAt * 1000,
        expiresAt: i.expiresAt ? i.expiresAt * 1000 : undefined,
      }));
    },
    dataUrl: (d) => dataUrlFor(d),
    authUrl: (d) => authUrlFor(d),
  },
};

export default resolvers;
