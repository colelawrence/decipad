import Boom from '@hapi/boom';
import {
  TableRecordIdentifier,
  PermissionType,
  PermissionRecord,
} from '@decipad/backendtypes';
import tables from '../tables';
import { hasMinimumPermission } from './minimum-permission';

function canonizeResource(resource: string): string {
  const [type, id] = resource.split('/').filter(notEmpty);
  return `/${type}/${id}`;
}

function notEmpty(str: string): boolean {
  return str.length > 0;
}

export async function isAuthorized({
  resource,
  user,
  secret,
  minimumPermissionType,
}: {
  resource: string;
  user: TableRecordIdentifier | undefined;
  secret?: string | undefined;
  minimumPermissionType: PermissionType;
}): Promise<PermissionType | null> {
  const data = await tables();
  const userPermissions: PermissionRecord[] = user
    ? (
        await data.permissions.query({
          IndexName: 'byResourceAndUser',
          KeyConditionExpression:
            'user_id = :user_id and resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':user_id': user.id,
            ':resource_uri': canonizeResource(resource),
          },
        })
      ).Items
    : [];
  const secretPermissions = secret
    ? (
        await data.permissions.query({
          IndexName: 'byResourceAndSecret',
          KeyConditionExpression:
            'secret = :secret and resource_uri = :resource_uri',
          ExpressionAttributeValues: {
            ':secret': secret,
            ':resource_uri': canonizeResource(resource),
          },
        })
      ).Items
    : [];

  const verify = hasMinimumPermission(minimumPermissionType);
  const allUserPermissions = [...userPermissions, ...secretPermissions];
  return verify(allUserPermissions);
}

export async function expectAuthorized({
  resource,
  user,
  secret,
  permissionType,
}: {
  resource: string;
  user: TableRecordIdentifier | undefined;
  secret?: string | undefined;
  permissionType: PermissionType;
}): Promise<void> {
  if (
    !(await isAuthorized({
      resource,
      user,
      secret,
      minimumPermissionType: permissionType,
    }))
  ) {
    throw Boom.unauthorized('Forbidden');
  }
}
