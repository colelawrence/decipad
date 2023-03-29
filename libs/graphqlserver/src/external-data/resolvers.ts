import { nanoid } from 'nanoid';
import {
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  ExternalDataSourceRecord,
  GraphqlContext,
  PageInput,
  PagedResult,
} from '@decipad/backendtypes';
import tables, { paginate } from '@decipad/tables';
import Resource from '@decipad/graphqlresource';
import { app } from '@decipad/config';
import { resource } from '@decipad/backend-resources';
import { identity } from 'ramda';

function baseUrlFor(externalDataSource: ExternalDataSourceRecord): string {
  const { urlBase, apiPathBase } = app();
  return `${urlBase}${apiPathBase}/externaldatasources/${externalDataSource.id}`;
}

function dataUrlFor(externalDataSource: ExternalDataSourceRecord): string {
  return `${baseUrlFor(externalDataSource)}/data`;
}

function authUrlFor(externalDataSource: ExternalDataSourceRecord): string {
  return `${baseUrlFor(externalDataSource)}/auth`;
}

const notebooks = resource('notebook');

const externalDataResource = Resource({
  resourceTypeName: 'externaldatasources',
  humanName: 'external data source',
  dataTable: async () => (await tables()).externaldatasources,
  toGraphql: identity,
  newRecordFrom: ({
    dataSource,
  }: {
    dataSource: ExternalDataSourceCreateInput;
  }) => {
    const eds = {
      id: nanoid(),
      name: dataSource.name,
      padId: dataSource.padId,
      provider: dataSource.provider,
      externalId: dataSource.externalId,
    };
    return eds;
  },
  updateRecordFrom: (
    record: ExternalDataSourceRecord,
    { dataSource }: { dataSource: ExternalDataSourceUpdateInput }
  ) => {
    return {
      ...record,
      ...dataSource,
    };
  },
  skipPermissions: true,
});

const resolvers = {
  Query: {
    getExternalDataSource: externalDataResource.getById,
    getExternalDataSources: async (
      _: unknown,
      { notebookId, page }: { notebookId: string; page: PageInput },
      context: GraphqlContext
    ): Promise<PagedResult<ExternalDataSourceRecord>> => {
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
  },

  Mutation: {
    createExternalDataSource: externalDataResource.create,
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
    keys: async (externalDataSource: ExternalDataSourceRecord) => {
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
    dataUrl: (d: ExternalDataSourceRecord) => dataUrlFor(d),
    authUrl: (d: ExternalDataSourceRecord) => authUrlFor(d),
  },
};

export default resolvers;
