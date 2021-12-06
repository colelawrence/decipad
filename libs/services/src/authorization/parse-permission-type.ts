import { PermissionType } from '@decipad/backendtypes';

const validPermissionTypes = ['READ', 'WRITE', 'ADMIN'];

export function parsePermissionType(str: string): PermissionType {
  if (validPermissionTypes.indexOf(str) < 0) {
    throw new TypeError(`Invalid permission type: ${str}`);
  }
  return str as PermissionType;
}
