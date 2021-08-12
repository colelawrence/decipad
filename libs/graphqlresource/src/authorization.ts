import { ForbiddenError } from 'apollo-server-lambda';
import { PermissionType, User } from '@decipad/backendtypes';
import { isAuthorized as isAuthorizedBase } from '@decipad/services/authorization';

type Context = {
  user?: User;
};

export function requireUser(context: Context): User {
  if (!context.user) {
    throw new ForbiddenError('Forbidden');
  }
  return context.user;
}

export async function isAuthorized(
  resource: string,
  context: Context,
  permissionType: PermissionType = 'READ'
): Promise<boolean> {
  const user = requireUser(context);
  return await isAuthorizedBase(resource, user, permissionType);
}

export async function check(
  resource: string,
  context: Context,
  permissionType: PermissionType
): Promise<User> {
  const user = requireUser(context);
  if (!(await isAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }
  return user;
}
