import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import { Resource } from '.';
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

export interface SecretAccess {
  secret: string;
  permission: PermissionType;
  canComment: boolean;
  createdAt?: number;
}

export interface Access {
  id: ID;
  roles?: RoleAccess[];
  users?: UserAccess[];
  secrets?: SecretAccess[];
}

export type AccessFunction<RecordT extends ConcreteRecord> = (
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
  return async (parent: RecordT): Promise<Access> => {
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
        user_id: p.user_id,
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
      id: parent.id,
      roles: roleAccesses,
      users: userAccesses,
      secrets: secretAccesses,
    };
  };
}
