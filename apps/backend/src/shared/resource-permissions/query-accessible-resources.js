const tables = require('../tables');
const uniqBy = require('lodash.uniqby');

async function queryAccessibleResources({
  userId,
  resourceType,
  parentResourceUri = null,
}) {
  const data = await tables();

  const q = {
    IndexName: 'byUserId',
    KeyConditionExpression:
      'user_id = :user_id and resource_type = :resource_type',
    ExpressionAttributeValues: {
      ':user_id': userId,
      ':resource_type': resourceType,
    },
  };

  if (parentResourceUri) {
    q.FilterExpression = 'parent_resource_uri = :parent_resource_uri';
    q.ExpressionAttributeValues[':parent_resource_uri'] = parentResourceUri;
  }

  const permissions = (await data.permissions.query(q)).Items;

  return uniqBy(permissions.map(permissionToResource), 'id');
}

function permissionToResource(permission) {
  return {
    id: permission.resource_id,
    type: permission.resource_type,
  };
}

module.exports = queryAccessibleResources;
