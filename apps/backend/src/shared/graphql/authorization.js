const { AuthenticationError, ForbiddenError } = require('apollo-server-lambda');
const tables = require('../tables');

function requireUser(context) {
  if (!context.user) {
    throw new AuthenticationError();
  }
  return context.user;
}

async function check(resource, context, permissionType) {
  const user = requireUser(context);

  const id = `/users/${user.id}${resource}`;
  const data = await tables();
  const permission = await data.permissions.get({ id });

  if (!permission || !isEnoughPermission(permission.type, permissionType)) {
    throw new ForbiddenError('Forbidden');
  }

  return user;
}

function isEnoughPermission(existingPermission, requiredPermission) {
  if (requiredPermission === 'READ') {
    return true;
  }
  if (requiredPermission === 'WRITE') {
    return existingPermission === 'WRITE' || existingPermission === 'ADMIN';
  }
  return existingPermission === 'ADMIN';
}

module.exports.requireUser = requireUser;
module.exports.check = check;
