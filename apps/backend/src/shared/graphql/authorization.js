const { ForbiddenError } = require('apollo-server-lambda');
const { isAuthorized } = require('../authorization');

function requireUser(context) {
  if (!context.user) {
    throw new ForbiddenError('Forbidden');
  }
  return context.user;
}

async function graphqlIsAuthorized(resource, context, permissionType = 'READ') {
  const user = requireUser(context);
  return await isAuthorized(resource, user, permissionType);
}

async function check(resource, context, permissionType) {
  const user = requireUser(context);

  if (!(await graphqlIsAuthorized(resource, context, permissionType))) {
    throw new ForbiddenError('Forbidden');
  }

  return user;
}

exports.requireUser = requireUser;
exports.isAuthorized = graphqlIsAuthorized;
exports.check = check;
