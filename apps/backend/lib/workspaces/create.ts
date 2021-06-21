import { nanoid } from 'nanoid';
import tables from '../tables';
import createResourcePermission from '../resource-permissions/create';

async function create(
  workspace: WorkspaceInput,
  user: TableRecordIdentifier
): Promise<WorkspaceRecord> {
  const newWorkspace = {
    id: nanoid(),
    name: workspace.name,
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

export default create;
