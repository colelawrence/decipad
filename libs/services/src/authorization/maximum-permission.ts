import { PermissionType } from '@decipad/backendtypes';
import { permissionLevelFrom } from './permission-level';

interface PermissionLikeRecord {
  type: PermissionType;
}

export function maximumPermissionIn(
  permissions: PermissionLikeRecord[]
): PermissionType | null {
  let maximumPermissionType: PermissionType | null = null;
  let maximumPermissionLevel = 0;
  for (const permission of permissions) {
    const permissionLevel = permissionLevelFrom(permission.type);
    if (permissionLevel > maximumPermissionLevel) {
      maximumPermissionType = permission.type;
      maximumPermissionLevel = permissionLevel;
    }
  }
  return maximumPermissionType;
}
