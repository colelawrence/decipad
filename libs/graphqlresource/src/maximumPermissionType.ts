import { PermissionRecord, PermissionType } from '@decipad/backendtypes';

function isOfType(type: PermissionType) {
  return (p: PermissionRecord): boolean => p.type === type;
}
export function maximumPermissionType(
  permissions: PermissionRecord[]
): PermissionType | undefined {
  return permissions.some(isOfType('ADMIN'))
    ? 'ADMIN'
    : permissions.some(isOfType('WRITE'))
    ? 'WRITE'
    : permissions.some(isOfType('READ'))
    ? 'READ'
    : undefined;
}
