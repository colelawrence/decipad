const tables = require('../tables');

async function create({
  userId = null,
  roleId = null,
  givenByUserId,
  resourceType,
  resourceId,
  resourceUri,
  type,
  parentResourceUri = null,
  canComment = false,
}) {
  const data = await tables();

  const resource = resourceUri
    ? resourceUri
    : `/${resourceType}${resourceId ? '/' + resourceId : ''}`;
  if (!resourceType) {
    const parts = resource.split('/');
    resourceType = parts[1];
    resourceId = parts.splice(2).join('/');
  }
  const id = `/users/${userId}/roles/${roleId}${resource}`;
  const newRolePermission = {
    id,
    resource_type: resourceType,
    resource_uri: resource,
    resource_id: resourceId,
    user_id: userId || 'null',
    role_id: roleId || 'null',
    given_by_user_id: givenByUserId,
    parent_resource_uri: parentResourceUri,
    can_comment: canComment,
    type,
    created_at: Date.now(),
  };

  await data.permissions.put(newRolePermission);
}

module.exports = create;
