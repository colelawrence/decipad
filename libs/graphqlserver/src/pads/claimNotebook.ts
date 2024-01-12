import { create } from '@decipad/services/permissions';
import tables from '@decipad/tables';
import { badRequest } from '@hapi/boom';

export async function claimNotebook(
  userId: string,
  notebookId: string
): Promise<void> {
  const { permissions, pads } = await tables();

  const perms = (
    await permissions.query({
      IndexName: 'byUserId',
      KeyConditionExpression:
        'user_id = :user_id and resource_type = :resource_type',
      ExpressionAttributeValues: {
        ':user_id': userId,
        ':resource_type': 'workspaces',
      },
    })
  ).Items;

  if (perms.length === 0) {
    throw badRequest('User has no workspaces');
  }

  const pad = await pads.get({ id: notebookId });
  if (pad == null) {
    throw badRequest('Notebook does not exist');
  }

  const firstWorkspaceId = perms[0].resource_id;

  await pads.put({
    ...pad,
    workspace_id: firstWorkspaceId,
    gist: undefined,
    isPublic: false,
  });

  await create({
    userId,
    givenByUserId: userId,
    resourceType: 'pads',
    resourceId: notebookId,
    type: 'ADMIN',
    canComment: true,
  });
}
