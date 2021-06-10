import { ForbiddenError } from 'apollo-server-lambda';
import { isAuthorized } from '../authorization';

type Context = {
  user?: {
    id: ID
  }
}

function requireUser(context: Context) {
  if (!context.user) {
    throw new ForbiddenError('Forbidden');
  }
  return context.user;
}

async function graphqlIsAuthorized(resource: string, context: Context, permissionType: PermissionType = 'READ') {
  const user = requireUser(context);
  return await isAuthorized(resource, user, permissionType);
}

async function check(resource: string, context: Context, permissionType: PermissionType) {
  const user = requireUser(context);

  if (!(await graphqlIsAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }

  return user;
}

export { requireUser, graphqlIsAuthorized as isAuthorized, check };
