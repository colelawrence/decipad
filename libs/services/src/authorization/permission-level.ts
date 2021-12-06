import { PermissionType } from '@decipad/backendtypes';

const permissionTypeToPermissionLevel: Record<PermissionType, number> = {
  ADMIN: 3,
  WRITE: 2,
  READ: 1,
};

export function permissionLevelFrom(permission: PermissionType): number {
  return permissionTypeToPermissionLevel[permission];
}
