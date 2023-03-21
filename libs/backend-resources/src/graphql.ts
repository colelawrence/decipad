import { PermissionType, User } from '@decipad/backendtypes';
import { isAuthorized as isAuthorizedBase } from '@decipad/services/authorization';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ForbiddenError } from 'apollo-server-lambda';

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

export async function isAuthorizedGraphql(
  resources: string[],
  context: Context,
  minimumPermissionType: PermissionType = 'READ'
): Promise<PermissionType | null> {
  const user = loadUser(context);
  const secret = loadSecret(context);
  return isAuthorizedBase({
    resources,
    user,
    secret,
    minimumPermissionType,
  });
}

export interface IsAuthenticatedAndAuthorizedGraphqlParams {
  resources: string[];
  context: Context;
  minimumPermissionType: PermissionType;
}

export async function isAuthenticatedAndAuthorizedGraphql({
  resources,
  context,
  minimumPermissionType,
}: IsAuthenticatedAndAuthorizedGraphqlParams): Promise<{
  user: User;
  permissionType: PermissionType;
}> {
  const user = requireUser(context);
  const permissionType = await isAuthorizedGraphql(
    resources,
    context,
    minimumPermissionType
  );
  if (!permissionType) {
    throw new ForbiddenError('Forbidden');
  }
  return { user, permissionType };
}
