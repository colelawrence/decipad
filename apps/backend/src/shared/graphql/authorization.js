const { ForbiddenError } = require('apollo-server-lambda');
const tables = require('../tables');

function requireUser(context) {
  if (!context.user) {
    throw new ForbiddenError('Forbidden');
  }
  return context.user;
}

async function isAuthorized(resource, context, permissionType) {
  const user = requireUser(context);
  const data = await tables();
  const permissions = (
    await data.permissions.query({
      IndexName: 'byResourceAndUser',
      KeyConditionExpression:
        'user_id = :user_id and resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':user_id': user.id,
        ':resource_uri': resource,
      },
    })
  ).Items;

  return permissions.some(isEnoughPermissionFor(permissionType));
}

async function check(resource, context, permissionType) {
  const user = requireUser(context);

  if (!(await isAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }

  return user;
}

function isEnoughPermissionFor(requiredPermissionType) {
  return (existingPermission) => {
    if (requiredPermissionType === 'READ') {
      return true;
    }
    if (requiredPermissionType === 'WRITE') {
      return (
        existingPermission.type === 'WRITE' ||
        existingPermission.type === 'ADMIN'
      );
    }
    return existingPermission.type === 'ADMIN';
  };
}

exports.requireUser = requireUser;
exports.isAuthorized = isAuthorized;
exports.check = check;
