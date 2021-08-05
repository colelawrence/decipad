import { ForbiddenError } from 'apollo-server-lambda';
import { ID, PermissionType } from '@decipad/backendtypes';
import { isAuthorized as isAuthorizedBase } from '@decipad/services/authorization';

type Context = {
  user?: {
    id: ID;
  };
};

export function requireUser(context: Context) {
  if (!context.user) {
    throw new ForbiddenError('Forbidden');
  }
  return context.user;
}

export async function isAuthorized(
  resource: string,
  context: Context,
  permissionType: PermissionType = 'READ'
) {
  const user = requireUser(context);
  return isAuthorizedBase(resource, user, permissionType);
}

export async function check(
  resource: string,
  context: Context,
  permissionType: PermissionType
) {
  const user = requireUser(context);
  if (!(await isAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }
  return user;
}
