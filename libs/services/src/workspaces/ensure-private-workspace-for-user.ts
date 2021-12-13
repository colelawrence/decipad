import { User, WorkspaceRecord } from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/services/tables';
import { create } from './create';
import { publicWorkspaceNameFor } from '../users';

export async function ensurePrivateWorkspaceForUser(
  user: User
): Promise<WorkspaceRecord> {
  const data = await tables();
  const query = {
    IndexName: 'byUserId',
    KeyConditionExpression:
      'user_id = :user_id AND resource_type = :resource_type',
    ExpressionAttributeValues: {
      ':user_id': user.id,
      ':resource_type': 'workspaces',
    },
  };

  let foundPrivateWorkspace: WorkspaceRecord | undefined;
  for await (const workspacePermission of allPages(data.permissions, query)) {
    if (workspacePermission) {
      const workspace = await data.workspaces.get({
        id: workspacePermission?.resource_id,
      });
      if (workspace && !workspace.isPublic) {
        foundPrivateWorkspace = workspace;
        break;
      }
    }
  }
  if (foundPrivateWorkspace) {
    return foundPrivateWorkspace;
  }
  return create(
    {
      name: publicWorkspaceNameFor(user),
      isPublic: false,
    },
    user
  );
}
