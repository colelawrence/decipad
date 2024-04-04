import type { SecretRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import type { BackendResourceDef } from '../types';

export const secret: BackendResourceDef<SecretRecord> = {
  name: 'secrets',
  delegateAccessToParentResource: true,
  parentResourceUriFromRecord: ({ workspace_id }: SecretRecord) =>
    `/workspaces/${workspace_id}`,
  dataTable: () => tables().then((d) => d.secrets),
  isPublic: () => false,
};
