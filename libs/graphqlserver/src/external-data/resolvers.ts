import { nanoid } from 'nanoid';
import {
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  ExternalDataSourceRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import Resource from '@decipad/graphqlresource';

function dataPathFor(externalDataSource: ExternalDataSourceRecord): string {
  return `/externaldatasources/${externalDataSource.id}`;
}

const externalDataResource = Resource({
  resourceTypeName: 'externaldatasources',
  humanName: 'external data source',
  dataTable: async () => (await tables()).externaldatasources,
  toGraphql: (d: ExternalDataSourceRecord) => ({
    ...d,
    dataPath: dataPathFor(d),
  }),
  newRecordFrom: ({
    dataSource,
  }: {
    dataSource: ExternalDataSourceCreateInput;
  }) => ({
    id: nanoid(),
    name: dataSource.name,
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
};

export default resolvers;
