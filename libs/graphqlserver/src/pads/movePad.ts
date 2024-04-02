import tables, { allPages } from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { resource } from '@decipad/backend-resources';
import { MutationResolvers } from '@decipad/graphqlserver-types';
import { padResource } from './padResource';

const notebooks = resource('notebook');
const workspaces = resource('workspace');

export const movePad: MutationResolvers['movePad'] = async (
  _,
  { id, workspaceId },
  context
) => {
  const data = await tables();
  const pad = await data.pads.get({ id });

  if (!pad) {
    throw new UserInputError('No such pad');
  }

  const { resources } = await notebooks.expectAuthorizedForGraphql({
    context,
    recordId: id,
    minimumPermissionType: 'ADMIN',
  });

  const { resources: workspaceResources } =
    await workspaces.expectAuthorizedForGraphql({
      context,
      recordId: workspaceId,
      minimumPermissionType: 'WRITE',
    });
  pad.workspace_id = workspaceId;
  await data.pads.put(pad);

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource',
    ExpressionAttributeValues: {
      ':resource': resources[0],
    },
  };

  const allPermissions = allPages(data.permissions, query);

  for await (const permission of allPermissions) {
    if (!permission) {
      continue;
    }
    if (permission.parent_resource_uri !== workspaceResources[0]) {
      [permission.parent_resource_uri] = workspaceResources;
      await data.permissions.put(permission);
    }
  }

  return padResource.toGraphql(pad);
};
