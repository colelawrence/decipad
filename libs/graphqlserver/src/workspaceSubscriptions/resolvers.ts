import { resource } from '@decipad/backend-resources';
import {
  GraphqlContext,
  Workspace,
  WorkspaceSubscriptionRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';

const workspaces = resource('workspace');

const getWorkspaceSubscription = async (
  workspaceId: string,
  context: GraphqlContext
): Promise<WorkspaceSubscriptionRecord | undefined> => {
  await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const data = await tables();
  return (
    await data.workspacesubscriptions.query({
      IndexName: 'byWorkspace',
      KeyConditionExpression: 'workspace_id = :workspace_id',
      ExpressionAttributeValues: {
        ':workspace_id': workspaceId,
      },
    })
  ).Items[0];
};

export default {
  Workspace: {
    async workspaceSubscription(
      workspace: Workspace,
      _: unknown,
      context: GraphqlContext
    ) {
      return getWorkspaceSubscription(workspace.id, context);
    },
  },
};
