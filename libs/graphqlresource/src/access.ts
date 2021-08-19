import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { Resource } from './';
import by from './utils/by';

export interface UserAccess {
  user_id: ID;
  permission: PermissionType;
  canComment: boolean;
  createdAt?: number;
}

export interface RoleAccess {
  role_id: ID;
  permission: PermissionType;
  canComment: boolean;
  createdAt?: number;
}

export interface Access {
  roles: RoleAccess[];
  users: UserAccess[];
}

export type AccessFunction<
  RecordT extends ConcreteRecord,
  > = (
  parent: RecordT,
  _: unknown,
  context: GraphqlContext
) => Promise<Access>;

export function access<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): AccessFunction<RecordT> {
  return async function (parent: RecordT): Promise<Access> {
    const resource = `/${resourceType.resourceTypeName}/${parent.id}`;
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
      .filter((p) => p.user_id === 'null')
      .map((p) => ({
        role_id: p.role_id,
        permission: p.type,
        canComment: p.can_comment,
        createdAt: p.createdAt,
      }));

    const userAccesses = permissions
      .filter((p) => p.role_id === 'null')
      .map((p) => ({
        user_id: p.user_id,
        permission: p.type,
        canComment: p.can_comment,
        createdAt: p.createdAt,
      }))
      .sort(by('permission'));

    return {
      roles: roleAccesses,
      users: userAccesses,
    };
  };
}
