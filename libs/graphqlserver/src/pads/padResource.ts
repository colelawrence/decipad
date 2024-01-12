/* eslint-disable @typescript-eslint/no-explicit-any */
import Resource from '@decipad/graphqlresource';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { nanoid } from 'nanoid';
import { resource } from '@decipad/backend-resources';
import { ID, PadRecord } from '@decipad/backendtypes';
import { Pad, PadInput } from '@decipad/graphqlserver-types';

const workspaces = resource('workspace');

// TODO: Migrate this over to be a generated type
type CreatePadType = {
  workspaceId: ID;
  pad: PadInput;
  sectionId?: ID;
};

type UpdatePadType = {
  id: ID;
  pad: PadInput;
};

export const padResource = Resource<
  PadRecord,
  Pad,
  CreatePadType,
  UpdatePadType
>({
  resourceTypeName: 'pads',
  humanName: 'notebook',
  dataTable: async () => (await tables()).pads,
  toGraphql: (d) => ({
    ...d,
    attachments: [],
    snapshots: [],
    tags: [],
    access: {} as any,
    padConnectionParams: {} as any,
    document: '',
    isTemplate: d.isTemplate != null ? true : undefined,
    createdAt: d.createdAt != null ? d.createdAt * 1000 : undefined,
    workspaceId: d.workspace_id,
    sectionId: d.section_id,
    gist: d.gist === 'ai' ? 'AI' : undefined,
  }),
  isPublic: (d) => Boolean(d.isPublic),

  newRecordFrom: ({ workspaceId, pad }) => ({
    id: nanoid(),
    name: pad.name ?? 'New Notebook',
    icon: pad.icon,
    status: pad.status,
    archived: pad.archived,
    section_id: pad.section_id,
    workspace_id: workspaceId,
    createdAt: timestamp(),
    isTemplate: 0,
  }),

  updateRecordFrom: (record, { pad }) => {
    return {
      ...record,
      ...pad,
      isTemplate: pad.isTemplate ? 1 : record.isTemplate,
    };
  },

  beforeCreate: async ({ workspaceId }, context) => {
    await workspaces.expectAuthorizedForGraphql({
      context,
      recordId: workspaceId,
      minimumPermissionType: 'READ',
    });
  },

  parentResourceUriFromCreateInput: ({ workspaceId }) =>
    workspaceId && `/workspaces/${workspaceId}`,
  /* eslint-disable camelcase */
  parentResourceUriFromRecord: ({ workspace_id }) =>
    /* eslint-disable camelcase */
    workspace_id && `/workspaces/${workspace_id}`,
  delegateAccessToParentResource: true,
});
