import { nanoid } from 'nanoid';
import {
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  ExternalDataSourceRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import Resource from '@decipad/graphqlresource';
import { app } from '@decipad/config';

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

const externalDataResource = Resource({
  resourceTypeName: 'externaldatasources',
  humanName: 'external data source',
  dataTable: async () => (await tables()).externaldatasources,
  toGraphql: (d: ExternalDataSourceRecord) => ({
    ...d,
    dataUrl: dataUrlFor(d),
    authUrl: authUrlFor(d),
  }),
  newRecordFrom: ({
    dataSource,
  }: {
    dataSource: ExternalDataSourceCreateInput;
  }) => ({
    id: nanoid(),
    name: dataSource.name,
    padId: dataSource.padId,
    provider: dataSource.provider,
    externalId: dataSource.externalId,
  }),
  updateRecordFrom: (
    record: ExternalDataSourceRecord,
    { dataSource }: { dataSource: ExternalDataSourceUpdateInput }
  ) => {
    return {
      ...record,
      ...dataSource,
    };
  },
});

const resolvers = {
  Query: {
    getExternalDataSource: externalDataResource.getById,
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
  },
};

export default resolvers;
