import { WorkspaceRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { BackendResourceDef } from '../types';

export const workspace: BackendResourceDef<WorkspaceRecord> = {
  name: 'workspaces',
  delegateAccessToParentResource: true,
  dataTable: () => tables().then((d) => d.workspaces),
  isPublic: (n) => n.isPublic,
};
