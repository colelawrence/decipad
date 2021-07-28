import { PermissionType } from '@decipad/backendtypes';
import tables from '../tables';

interface ResourceCreateArgs {
  userId?: string;
  roleId?: string;
  givenByUserId: string;
  resourceType?: string;
  resourceId?: string;
  resourceUri?: string;
  type: PermissionType;
  parentResourceUri?: string;
  canComment?: boolean;
}

export async function create(args: ResourceCreateArgs) {
  const {
    userId = null,
    roleId = null,
    givenByUserId,
    resourceType: _resourceType,
    resourceId: _resourceId,
    resourceUri,
    type,
    parentResourceUri = undefined,
    canComment = false,
  } = args;

  let resourceType = _resourceType;
  let resourceId = _resourceId;

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
  const newPermission = {
    id,
    resource_type: resourceType,
    resource_uri: resource,
    resource_id: resourceId!,
    user_id: userId || 'null',
    role_id: roleId || 'null',
    given_by_user_id: givenByUserId,
    parent_resource_uri: parentResourceUri,
    can_comment: canComment,
    type,
  };

  await data.permissions.create(newPermission);
}
