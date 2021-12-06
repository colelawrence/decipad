import { ForbiddenError } from 'apollo-server-lambda';
import { PermissionType, User } from '@decipad/backendtypes';
import { isAuthorized as isAuthorizedBase } from '@decipad/services/authorization';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

type Context = {
  user?: User;
  event: APIGatewayProxyEventV2;
};

export function loadUser(context: Context): User | undefined {
  return context.user;
}
export function requireUser(context: Context): User {
  const user = loadUser(context);
  if (!user) {
    throw new ForbiddenError('Forbidden');
  }
  return user;
}
export function loadSecret(context: Context): string | undefined {
  return context.event.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
}

export async function isAuthorized(
  resource: string,
  context: Context,
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

export async function expectAuthenticatedAndAuthorized(
  resource: string,
  context: Context,
  permissionType: PermissionType
): Promise<void> {
  if (!(await isAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }
}
