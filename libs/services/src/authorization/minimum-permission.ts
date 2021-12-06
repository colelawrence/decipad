import { PermissionType } from '@decipad/backendtypes';
import { permissionLevelFrom } from './permission-level';
import { maximumPermissionIn } from './maximum-permission';

interface PermissionLikeRecord {
  type: PermissionType;
}

export function minimumPermissionIn(
  permissions: PermissionLikeRecord[]
): PermissionType | null {
  let minimumPermissionType: PermissionType | null = null;
  let minimumPermissionLevel = Infinity;
  for (const permission of permissions) {
    const permissionLevel = permissionLevelFrom(permission.type);
    if (permissionLevel < minimumPermissionLevel) {
      minimumPermissionType = permission.type;
      minimumPermissionLevel = permissionLevel;
    }
  }
  return minimumPermissionType;
}

export const hasMinimumPermission =
  (permissionType: PermissionType) =>
  (userPermissions: PermissionLikeRecord[]): PermissionType | null => {
    const minimumRequiredPermissionLevel = permissionLevelFrom(permissionType);
    const minimumPermissionType = minimumPermissionIn(userPermissions);
    const maximumPermissionType = maximumPermissionIn(userPermissions);
    if (minimumPermissionType == null || maximumPermissionType == null) {
      return null;
    }
    if (
      permissionLevelFrom(maximumPermissionType) <
      minimumRequiredPermissionLevel
    ) {
      return null;
    }
    return maximumPermissionType;
  };
