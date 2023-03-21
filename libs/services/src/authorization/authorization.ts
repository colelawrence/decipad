import {
  PermissionRecord,
  PermissionType,
  TableRecordIdentifier,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { hasMinimumPermission } from './minimum-permission';

function canonizeResource(resource: string): string {
  const [type, id] = resource.split('/').filter(notEmpty);
  return `/${type}/${id}`;
}

function notEmpty(str: string): boolean {
  return str.length > 0;
}

export type IsAuthorizedParams = {
  user?: TableRecordIdentifier;
  secret?: string;
  minimumPermissionType: PermissionType;
  resource?: string;
  resources?: string[];
};

export const isAuthorized = async ({
  resource: _resource,
  resources: _resources = [],
  user,
  secret,
  minimumPermissionType,
}: IsAuthorizedParams): Promise<PermissionType | null> => {
  const resources = (
    typeof _resource === 'string' ? [_resource, ..._resources] : _resources
  ).map(canonizeResource);
  const data = await tables();
  const userPermissions: PermissionRecord[] = user
    ? (
        await Promise.all(
          resources.map(
            async (resource) =>
              (
                await data.permissions.query({
                  IndexName: 'byResourceAndUser',
                  KeyConditionExpression:
                    'user_id = :user_id and resource_uri = :resource',
                  ExpressionAttributeValues: {
                    ':user_id': user.id,
                    ':resource': resource,
                  },
                })
              ).Items
          )
        )
      ).flat(1)
    : [];
  const secretPermissions = secret
    ? (
        await Promise.all(
          resources.map(
            async (resource) =>
              (
                await data.permissions.query({
                  IndexName: 'byResourceAndSecret',
                  KeyConditionExpression:
                    'secret = :secret and resource_uri = :resource',
                  ExpressionAttributeValues: {
                    ':secret': secret,
                    ':resource': resource,
                  },
                })
              ).Items
          )
        )
      ).flat(1)
    : [];

  for (const resource of resources) {
    if (
      !userPermissions.length &&
      !secretPermissions.length &&
      resource.match(/^\/pads\/.*/)
    ) {
      // shortcut for when pad is public
      const padId = resource.split('/')[2];
      // eslint-disable-next-line no-await-in-loop
      const pad = await data.pads.get({ id: padId });
      if (pad?.isPublic && minimumPermissionType === 'READ') {
        return 'READ';
      }
    }
  }

  const verify = hasMinimumPermission(minimumPermissionType);
  const allUserPermissions = [...userPermissions, ...secretPermissions];
  return verify(allUserPermissions);
};

export const expectAuthorized = async ({
  resource,
  resources,
  user,
  secret,
  minimumPermissionType,
}: IsAuthorizedParams): Promise<PermissionType> => {
  const permissionType = await isAuthorized({
    resource,
    resources,
    user,
    secret,
    minimumPermissionType,
  });
  if (!permissionType) {
    throw Boom.unauthorized('Forbidden');
  }
  return permissionType;
};
