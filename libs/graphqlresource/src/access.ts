import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import by from './utils/by';
import { Resource, ResourceResolvers } from './types';
import { ResourceAccess } from '@decipad/graphqlserver-types';

export function access<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): ResourceResolvers<RecordT, GraphqlT, CreateT, UpdateT>['access'] {
  return async (parent) => {
    const resource = `/${resourceType.resourceTypeName}/${getDefined(
      (parent as { id: string }).id
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
      .map((p) => ({
        role_id: p.role_id,
        permission: p.type,
        canComment: p.can_comment,
        createdAt: p.createdAt,
      }))
      .sort(by('permission'));

    const userAccesses = permissions
      .filter((p) => p.user_id !== 'null' && p.role_id === 'null')
      .map((p) => ({
        userId: p.user_id,
        permission: p.type,
        canComment: p.can_comment,
        createdAt: p.createdAt,
      }))
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
      id: getDefined((parent as { id: string }).id),
      roles: roleAccesses,
      users: userAccesses,
      secrets: secretAccesses,
    } as unknown as ResourceAccess;
  };
}
