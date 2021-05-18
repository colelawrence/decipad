const tables = require('../tables');

async function create({
  userId,
  givenByUserId,
  resourceType,
  resourceId,
  type,
  parentResourceUri = null,
  roleId = null,
}) {
  const data = await tables();

  const resource = `/${resourceType}/${resourceId}`;
  const id = `/users/${userId}/roles/${roleId}${resource}`;
  const newRolePermission = {
    id,
    resource_type: resourceType,
    resource_uri: resource,
    resource_id: resourceId,
    user_id: userId,
    given_by_user_id: givenByUserId,
    parent_resource_uri: parentResourceUri,
    role_id: roleId,
    type,
  };

  await data.permissions.put(newRolePermission);
}

module.exports = create;
