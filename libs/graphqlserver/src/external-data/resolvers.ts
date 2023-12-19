import { resource } from '@decipad/backend-resources';
import { ExternalDataSourceRecord } from '@decipad/backendtypes';
import { app } from '@decipad/backend-config';
import Resource from '@decipad/graphqlresource';
import tables, { paginate } from '@decipad/tables';
import { nanoid } from 'nanoid';
import {
  ExternalDataSource,
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  ExternalProvider,
  Resolvers,
} from '@decipad/graphqlserver-types';
import { getDefined } from '@decipad/utils';

const isDatabaseSource = new Set<ExternalProvider>([
  'postgresql',
  'mysql',
  'oracledb',
  'cockroachdb',
  'redshift',
  'mariadb',
]);

function baseUrlFor(externalDataSource: ExternalDataSource): string {
  const { urlBase, apiPathBase } = app();
  return `${urlBase}${apiPathBase}/externaldatasources/${
    isDatabaseSource.has(externalDataSource.provider) ? 'db/' : ''
  }${externalDataSource.id}`;
}

function dataUrlFor(externalDataSource: ExternalDataSource): string {
  return `${baseUrlFor(externalDataSource)}/data`;
}

function authUrlFor(externalDataSource: ExternalDataSource): string {
  return `${baseUrlFor(externalDataSource)}/auth`;
}

const notebooks = resource('notebook');
const workspaces = resource('workspace');

const externalDataResource = Resource<
  ExternalDataSourceRecord,
  ExternalDataSource,
  ExternalDataSourceCreateInput,
  { dataSource: ExternalDataSourceUpdateInput }
>({
  resourceTypeName: 'externaldatasources',
  humanName: 'external data source',
  dataTable: async () => (await tables()).externaldatasources,
  toGraphql: (record) => {
    return {
      ...record,
      // Sub resolvers will find these.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      access: {} as any,
      keys: [],
    } satisfies ExternalDataSource;
  },
  newRecordFrom: ({
    name,
    padId,
    workspace_id: workspaceId,
    provider,
    externalId,
    dataSourceName,
  }) => {
    const eds: ExternalDataSourceRecord = {
      id: nanoid(),
      name,
      padId,
      workspace_id: workspaceId,
      provider: provider as ExternalDataSourceRecord['provider'],
      externalId,
      dataSourceName,
    };
    return eds;
  },
  updateRecordFrom: (record, { dataSource }) => {
    return {
      ...record,
      ...dataSource,
    };
  },
  skipPermissions: true,
});

const resolvers: Resolvers = {
  Query: {
    async getExternalDataSource(pad, input, context) {
      return getDefined(
        await externalDataResource.getById(pad, input, context)
      );
    },
    getExternalDataSources: async (_, { notebookId, page }, context) => {
      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: notebookId,
        minimumPermissionType: 'READ',
      });
      const data = await tables();
      return paginate(
        data.externaldatasources,
        {
          IndexName: 'byPadId',
          KeyConditionExpression: 'padId = :padId',
          ExpressionAttributeValues: {
            ':padId': notebookId,
          },
        },
        page,
        { gqlType: 'ExternalDataSource' }
      );
    },
    getExternalDataSourcesWorkspace: async (
      _,
      { workspaceId, page },
      context
    ) => {
      await workspaces.expectAuthorizedForGraphql({
        context,
        recordId: workspaceId,
        minimumPermissionType: 'READ',
      });
      const data = await tables();

      return paginate(
        data.externaldatasources,
        {
          IndexName: 'byWorkspace',
          KeyConditionExpression: 'workspace_id = :workspaceId',
          ExpressionAttributeValues: {
            ':workspaceId': workspaceId,
          },
        },
        page,
        { gqlType: 'ExternalDataSource' }
      );
    },
  },

  Mutation: {
    async createExternalDataSource(_, { dataSource }, context) {
      return externalDataResource.create(_, dataSource, context);
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
            ':resource_uri': `/pads/${externalDataSource.padId}`,
          },
        })
      ).Items;
    },
    dataUrl: (d) => dataUrlFor(d),
    authUrl: (d) => authUrlFor(d),
  },
};

export default resolvers;
