import type { ExternalDataSourceRecord } from '@decipad/backendtypes';
import { app } from '@decipad/backend-config';
import Resource from '@decipad/graphqlresource';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
import type {
  ExternalDataSource,
  ExternalDataSourceCreateInput,
  ExternalDataSourceUpdateInput,
  ExternalProvider,
} from '@decipad/graphqlserver-types';
import omit from 'lodash/omit';
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

export function dataUrlFor(externalDataSource: ExternalDataSource): string {
  return `${baseUrlFor(externalDataSource)}/data`;
}

export function authUrlFor(externalDataSource: ExternalDataSource): string {
  return `${baseUrlFor(externalDataSource)}/auth`;
}

export const externalDataResource = Resource<
  ExternalDataSourceRecord,
  ExternalDataSource,
  ExternalDataSourceCreateInput & { expiresAt?: number },
  { dataSource: ExternalDataSourceUpdateInput }
>({
  resourceTypeName: 'externaldatasources',
  humanName: 'external data source',
  dataTable: async () => (await tables()).externaldatasources,
  toGraphql: (record) => {
    if (record.workspace_id) {
      return {
        ...omit(record, 'workspace_id'),
        owner: 'WORKSPACE',
        ownerId: record.workspace_id,

        // Sub resolvers will find these.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        access: {} as any,
        dataLinks: [],
        keys: [],
      };
    }

    if (record.padId) {
      return {
        ...record,
        owner: 'PAD',
        ownerId: record.padId,

        // Sub resolvers will find these.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        access: {} as any,
        dataLinks: [],
        keys: [],
      };
    }

    throw new Error('Impossible branch');
  },
  newRecordFrom: (record) => {
    const { name, provider, externalId, dataSourceName, expiresAt } = record;

    const eds: ExternalDataSourceRecord = {
      id: nanoid(),
      name,
      padId: undefined,
      workspace_id: undefined,
      provider: provider as ExternalDataSourceRecord['provider'],
      externalId,
      dataSourceName,
      expiresAt,
    };

    //
    // GraphQL doesnt support string literal or
    // discriminent unions, which we use in typescript for unions
    //
    // So we have to manually check keys.
    // You'll notice `record.padId` gets type `string`, so we know this is working
    // Otherwise it will have type `unknown`
    //

    if ('padId' in record) {
      eds.padId = record.padId;
    } else if ('workspaceId' in record) {
      eds.workspace_id = record.workspaceId;
    }

    return eds;
  },
  updateRecordFrom: (record, { dataSource }) => {
    return {
      ...record,
      ...dataSource,
    };
  },
  delegateAccessToParentResource: true,
  parentResourceUriFromRecord: (record) =>
    record.padId
      ? `/pads/${record.padId}`
      : `/workspaces/${getDefined(record.workspace_id)}`,
});
