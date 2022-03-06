import { PermissionType } from '@decipad/backendtypes';
import { permissionLevelFrom } from './permission-level';

interface PermissionLikeRecord {
  type: PermissionType;
}

function permissionType(permission: PermissionLikeRecord | PermissionType) {
  return (permission as PermissionLikeRecord).type
    ? (permission as PermissionLikeRecord).type
    : (permission as PermissionType);
}

export function maximumPermissionIn(
  permissions: PermissionLikeRecord[] | PermissionType[]
): PermissionType | undefined {
  let maximumPermissionType: PermissionType | undefined;
  let maximumPermissionLevel = 0;
  for (const permission of permissions) {
    const permissionLevel = permissionLevelFrom(permissionType(permission));
    if (permissionLevel > maximumPermissionLevel) {
      maximumPermissionType = permissionType(permission);
      maximumPermissionLevel = permissionLevel;
    }
  }
  return maximumPermissionType;
}
