import { User, WorkspaceRecord } from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/tables';
import { create } from './create';
import { publicWorkspaceNameFor } from '../users';

export async function ensurePublicWorkspaceForUser(
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

  let foundPublicWorkspace: WorkspaceRecord | undefined;
  for await (const workspacePermission of allPages(data.permissions, query)) {
    if (workspacePermission) {
      const workspace = await data.workspaces.get({
        id: workspacePermission?.resource_id,
      });
      if (workspace?.isPublic) {
        foundPublicWorkspace = workspace;
        break;
      }
    }
  }
  if (foundPublicWorkspace) {
    return foundPublicWorkspace;
  }
  return create(
    {
      name: publicWorkspaceNameFor(user),
      isPublic: true,
    },
    user
  );
}
