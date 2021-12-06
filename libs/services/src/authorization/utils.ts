import { PermissionRecord, PermissionType } from '@decipad/backendtypes';

export function P(type: PermissionType): PermissionRecord {
  return {
    type,
    id: 'permission id',
    resource_type: 'any',
    resource_uri: 'uri',
    resource_id: 'id',
    user_id: 'user id',
    given_by_user_id: 'user id',
    role_id: 'role id',
    can_comment: false,
  };
}
