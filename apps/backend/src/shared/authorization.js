const tables = require('./tables');

async function isAuthorized(resource, user, permissionType = 'READ') {
  if (resource.endsWith('/')) {
    resource = resource.substring(0, resource.length - 1);
  }
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
    return existingPermission.type === requiredPermissionType;
  };
}

exports.isAuthorized = isAuthorized;
