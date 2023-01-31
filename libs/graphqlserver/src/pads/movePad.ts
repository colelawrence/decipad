import { GraphqlContext, ID, Pad } from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const movePad = async (
  _: unknown,
  { id, workspaceId }: { id: ID; workspaceId: ID },
  context: GraphqlContext
): Promise<Pad> => {
  const data = await tables();
  const pad = await data.pads.get({ id });

  if (!pad) {
    throw new UserInputError('No such pad');
  }

  const padResource = `/pads/${id}`;
  await isAuthenticatedAndAuthorized(padResource, context, 'ADMIN');
  const workspaceResource = `/workspaces/${workspaceId}`;
  await isAuthenticatedAndAuthorized(workspaceResource, context, 'WRITE');

  pad.workspace_id = workspaceId;
  await data.pads.put(pad);

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource',
    ExpressionAttributeValues: {
      ':resource': padResource,
    },
  };

  const allPermissions = await allPages(data.permissions, query);

  for await (const permission of allPermissions) {
    if (!permission) {
      continue;
    }
    if (permission.parent_resource_uri !== workspaceResource) {
      permission.parent_resource_uri = workspaceResource;
      await data.permissions.put(permission);
    }
  }

  return pad;
};
