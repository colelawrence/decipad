import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { expectAuthenticated } from '@decipad/services/authentication';
import { PermissionType, User } from '@decipad/backendtypes';
import { resource } from '@decipad/backend-resources';

const notebooks = resource('notebook');

export const checkNotebookAccess = async (
  notebookId: string,
  event: APIGatewayProxyEvent,
  permissionType: PermissionType = 'READ'
): Promise<User | undefined> => {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw Boom.notFound(`No such notebook with id ${notebookId}`);
  }
  if (!notebook.isPublic) {
    const [credentials] = await expectAuthenticated(event);
    if (!credentials) {
      throw Boom.forbidden();
    }
    const { user } = credentials;
    if (!user) {
      throw Boom.forbidden();
    }
    notebooks.expectAuthorized({
      recordId: notebookId,
      minimumPermissionType: permissionType,
      user,
    });
    return user;
  }
  return undefined;
};
