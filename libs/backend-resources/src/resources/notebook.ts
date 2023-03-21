import { PadRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { BackendResourceDef } from '../types';

export const notebook: BackendResourceDef<PadRecord> = {
  name: 'pads',
  delegateAccessToParentResource: true,
  parentResourceUriFromRecord: ({ workspace_id }: PadRecord) =>
    `/workspaces/${workspace_id}`,
  dataTable: () => tables().then((d) => d.pads),
  isPublic: (n) => n.isPublic,
};
