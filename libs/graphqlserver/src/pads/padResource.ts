import { GraphqlContext, ID, PadInput, PadRecord } from '@decipad/backendtypes';
import Resource from '@decipad/graphqlresource';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/services/utils';
import { nanoid } from 'nanoid';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const padResource = Resource({
  resourceTypeName: 'pads',
  humanName: 'notebook',
  dataTable: async () => (await tables()).pads,
  toGraphql: (d) => ({
    ...d,
    createdAt: d.createdAt != null ? d.createdAt * 1000 : undefined,
  }),
  isPublic: (d: PadRecord) => Boolean(d.isPublic),

  newRecordFrom: ({
    workspaceId,
    pad,
  }: {
    workspaceId: ID;
    pad: PadInput;
  }) => ({
    id: nanoid(),
    name: pad.name,
    icon: pad.icon,
    status: pad.status,
    archived: pad.archived,
    workspace_id: workspaceId,
    section_id: pad.section_id,
    createdAt: timestamp(),
  }),

  updateRecordFrom: (record: PadRecord, { pad }: { pad: PadInput }) => {
    return {
      ...record,
      ...pad,
    };
  },

  beforeCreate: async (
    { workspaceId }: { workspaceId: ID },
    context: GraphqlContext
  ) => {
    const workspaceResource = `/workspaces/${workspaceId}`;
    await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');
  },

  parentResourceUriFromCreateInput: ({ workspaceId }: { workspaceId: ID }) =>
    `/workspaces/${workspaceId}`,
  /* eslint-disable camelcase */
  parentResourceUriFromRecord: ({ workspace_id }: { workspace_id: ID }) =>
    /* eslint-disable camelcase */
    `/workspaces/${workspace_id}`,
});
