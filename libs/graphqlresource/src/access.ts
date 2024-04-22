import type { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import type { Resource, ResourceResolvers } from './types';
import type {
  ResourceAccess,
  RoleAccess,
  UserAccess,
} from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import by from './utils/by';

export function access<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): ResourceResolvers<RecordT, GraphqlT, CreateT, UpdateT>['access'] {
  return async (parent) => {
    const parentId = (parent as { id: string }).id;

    const resource = `/${resourceType.resourceTypeName}/${getDefined(
      parentId
    )}`;
    const data = await tables();
    const permissions = (
      await data.permissions.query({
        IndexName: 'byResource',
        KeyConditionExpression: 'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': resource,
        },
      })
    ).Items;

    const roleAccesses = permissions
      .filter((p) => p.role_id !== 'null')
      .map(
        (p): RoleAccess => ({
          roleId: p.role_id,
          resourceId: parentId,
          permission: p.type,
          canComment: p.can_comment,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: {} as any, // Picked up by sub resolvers
        })
      )
      .sort(by('permission'));

    const userAccesses = permissions
      .filter((p) => p.user_id !== 'null' && p.role_id === 'null')
      .map(
        (p): UserAccess => ({
          userId: p.user_id,
          resourceId: parentId,
          permission: p.type,
          canComment: p.can_comment,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user: {} as any, // Picked up by sub resolvers
        })
      )
      .sort(by('permission'));

    const secretAccesses = permissions
      .filter(
        (p) =>
          p.user_id === 'null' && p.role_id === 'null' && p.secret !== 'null'
      )
      .map((p) => ({
        secret: getDefined(p.secret),
        permission: p.type,
        canComment: p.can_comment,
        createdAt: p.createdAt,
      }))
      .sort(by('permission'));

    return {
      id: parentId,
      roles: roleAccesses,
      users: userAccesses,
      secrets: secretAccesses,
    } as unknown as ResourceAccess;
  };
}
