import { isAuthorized as isAuthorizedBase } from '@decipad/services/authorization';
import { ForbiddenError } from 'apollo-server-lambda';
import tables from '@decipad/tables';
import { GraphqlContext, PermissionType } from '@decipad/graphqlserver-types';
import { User } from '@decipad/backendtypes';

export function loadUser(context: GraphqlContext): User | undefined {
  return context.user;
}
export function requireUser(context: GraphqlContext): User {
  const user = loadUser(context);
  if (!user) {
    throw new ForbiddenError('Forbidden');
  }
  return user;
}
export function loadSecret(context: GraphqlContext): string | undefined {
  return context.event.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
}

export async function isAuthorized(
  resource: string,
  context: GraphqlContext,
  permissionType: PermissionType = 'READ'
): Promise<PermissionType | null> {
  const user = loadUser(context);
  const secret = loadSecret(context);
  return isAuthorizedBase({
    resource,
    user,
    secret,
    minimumPermissionType: permissionType,
  });
}

export async function isAuthenticatedAndAuthorized(
  resource: string,
  context: GraphqlContext,
  permissionType: PermissionType
): Promise<User> {
  const user = requireUser(context);
  if (!(await isAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }
  return user;
}

export async function isSuperAdmin(context: GraphqlContext): Promise<boolean> {
  const user = requireUser(context);
  const data = await tables();
  const superAdmin = await data.superadminusers.get({ id: user.id });
  return superAdmin != null;
}
