import { nanoid } from 'nanoid';
import type {
  WorkspaceInput,
  TableRecordIdentifier,
  WorkspaceRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { create as createResourcePermission } from '../permissions/create';
import type { SubscriptionPlansNames } from '@decipad/graphqlserver-types';

function getWorkspacePlan(wsName: string): SubscriptionPlansNames {
  if (process.env.NODE_ENV === 'production' || !wsName.includes('@n1n')) {
    return 'free';
  }

  if (wsName.includes('team')) {
    return 'team';
  }

  if (wsName.includes('enterprise')) {
    return 'enterprise';
  }

  if (wsName.includes('personal')) {
    return 'personal';
  }

  return 'pro';
}

export async function create(
  workspace: WorkspaceInput,
  user: TableRecordIdentifier
): Promise<WorkspaceRecord> {
  const newWorkspace: WorkspaceRecord = {
    id: nanoid(),
    name: workspace.name,
    isPublic: workspace.isPublic || false,
    plan: getWorkspacePlan(workspace.name),
  };

  const data = await tables();
  await data.workspaces.create(newWorkspace);

  const newWorkspaceAdminRole = {
    id: nanoid(),
    name: 'Administrator',
    permission: 'ADMIN',
    workspace_id: newWorkspace.id,
    system: true,
  };

  await data.workspaceroles.put(newWorkspaceAdminRole);

  await createResourcePermission({
    resourceType: 'roles',
    resourceId: newWorkspaceAdminRole.id,
    userId: user.id,
    type: 'ADMIN',
    roleId: newWorkspaceAdminRole.id,
    givenByUserId: user.id,
    parentResourceUri: `/workspaces/${newWorkspace.id}`,
  });

  await createResourcePermission({
    resourceType: 'workspaces',
    resourceId: newWorkspace.id,
    userId: user.id,
    type: 'ADMIN',
    roleId: newWorkspaceAdminRole.id,
    givenByUserId: user.id,
  });

  return newWorkspace;
}
