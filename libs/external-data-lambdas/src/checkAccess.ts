import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { expectAuthenticated } from '@decipad/services/authentication';
import { PermissionType, User } from '@decipad/backendtypes';
import { resource } from '@decipad/backend-resources';

const notebooks = resource('notebook');
const workspaces = resource('workspace');

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

export const checkWorkspaceAccess = async (
  workspaceId: string,
  event: APIGatewayProxyEvent,
  permissionType: PermissionType = 'READ'
): Promise<User> => {
  const data = await tables();
  const workspace = await data.workspaces.get({ id: workspaceId });
  if (!workspace) {
    throw Boom.notFound(`No such workspace with id ${workspaceId}`);
  }
  const [credentials] = await expectAuthenticated(event);
  if (!credentials) {
    throw Boom.forbidden();
  }
  const { user } = credentials;
  if (!user) {
    throw Boom.forbidden();
  }
  workspaces.expectAuthorized({
    recordId: workspaceId,
    minimumPermissionType: permissionType,
    user,
  });
  return user;
};

export const checkNotebookOrWorkspaceAccess = async (params: {
  workspaceId?: string;
  notebookId?: string;
  event: APIGatewayProxyEvent;
  permissionType?: PermissionType;
}): Promise<User | undefined> => {
  if (params.workspaceId) {
    return checkWorkspaceAccess(
      params.workspaceId,
      params.event,
      params.permissionType
    );
  }

  if (params.notebookId) {
    return checkNotebookAccess(
      params.notebookId,
      params.event,
      params.permissionType
    );
  }
  throw Boom.forbidden('Provide either workspaceId or notebookId');
};
