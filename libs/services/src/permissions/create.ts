import { PermissionType } from '@decipad/backendtypes';
import tables from '@decipad/tables';

interface ResourceCreateArgs {
  userId?: string;
  roleId?: string;
  secret?: string;
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
    secret,
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

  const resource =
    resourceUri || `/${resourceType}${resourceId ? `/${resourceId}` : ''}`;
  if (!resourceType) {
    const parts = resource.split('/');
    [, resourceType] = parts;
    resourceId = parts.splice(2).join('/');
  }
  if (userId && secret) {
    throw new TypeError(
      'cannot encode permission with both user id and secret'
    );
  }
  if (roleId && secret) {
    throw new TypeError(
      'cannot encode permission with both roleId and secret '
    );
  }
  const roleOrSecretEncodedPart = `/${userId || roleId ? 'roles' : 'secrets'}/${
    roleId || secret || 'null'
  }`;
  const id = `/users/${userId}${roleOrSecretEncodedPart}${resource}`;
  const newPermission = {
    id,
    resource_type: resourceType,
    resource_uri: resource,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resource_id: resourceId!,
    user_id: userId || 'null',
    role_id: roleId || 'null',
    secret: secret || 'null',
    given_by_user_id: givenByUserId,
    parent_resource_uri: parentResourceUri,
    can_comment: canComment,
    type,
  };

  await data.permissions.create(newPermission);
}
