const { AuthenticationError, ForbiddenError } = require('apollo-server-lambda');
const tables = require('../tables');

function requireUser(context) {
  if (!context.user) {
    throw new AuthenticationError();
  }
  return context.user;
}

async function isAuthorized(resource, context, permissionType) {
  const user = requireUser(context);

  const id = `/users/${user.id}${resource}`;
  const data = await tables();
  const permission = await data.permissions.get({ id });

  return permission && isEnoughPermission(permission.type, permissionType);
}

async function check(resource, context, permissionType) {
  const user = requireUser(context);

  if (! await isAuthorized(resource, context, permissionType)) {
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

exports.requireUser = requireUser;
exports.isAuthorized = isAuthorized;
exports.check = check;
