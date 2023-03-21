import { WorkspaceInput, WorkspaceRecord } from '@decipad/backendtypes';
import Resource from '@decipad/graphqlresource';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { nanoid } from 'nanoid';

export const workspaceResource = Resource({
  resourceTypeName: 'workspaces',
  humanName: 'workspace',
  dataTable: async () => (await tables()).workspaces,
  toGraphql: (d) => ({
    ...d,
    createdAt: d.createdAt != null ? d.createdAt * 1000 : undefined,
  }),
  isPublic: (d) => Boolean(d.isPublic),

  newRecordFrom: (workspace: WorkspaceInput) => ({
    ...workspace,
    id: nanoid(),
    createdAt: timestamp(),
  }),

  updateRecordFrom: (
    record: WorkspaceRecord,
    { workspace }: { workspace: WorkspaceInput }
  ) => {
    return {
      ...record,
      ...workspace,
    };
  },
});
