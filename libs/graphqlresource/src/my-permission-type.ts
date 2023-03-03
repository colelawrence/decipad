import {
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { Resource } from '.';
import { maximumPermissionType } from './maximumPermissionType';

export type MyPermissionTypeFunction<RecordT extends ConcreteRecord> = (
  parent: RecordT,
  _: unknown,
  context: GraphqlContext
) => Promise<PermissionType | undefined>;

export function myPermissionType<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): MyPermissionTypeFunction<RecordT> {
  return async (
    parent: RecordT,
    _: unknown,
    context: GraphqlContext
  ): Promise<PermissionType | undefined> => {
    const resource = `/${resourceType.resourceTypeName}/${parent.id}`;
    const data = await tables();
    const { user } = context;
    const secret =
      context.event.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    const FilterExpression = [
      user ? 'user_id = :user_id' : '',
      secret ? 'secret = :secret' : '',
    ]
      .filter(Boolean)
      .join(' OR ');
    const ExpressionAttributeValues: Record<string, string> = {
      ':resource_uri': resource,
    };
    if (user) {
      ExpressionAttributeValues[':user_id'] = user.id;
    }
    if (secret) {
      ExpressionAttributeValues[':secret'] = secret;
    }

    if (user || secret) {
      const permissions = (
        await data.permissions.query({
          IndexName: 'byResource',
          KeyConditionExpression: 'resource_uri = :resource_uri',
          FilterExpression,
          ExpressionAttributeValues,
        })
      ).Items;

      return maximumPermissionType(permissions);
    }
    return undefined;
  };
}
