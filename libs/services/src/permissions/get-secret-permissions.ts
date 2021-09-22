import {
  DynamoDbQuery,
  PermissionRecord,
  PermissionType,
} from '@decipad/backendtypes';
import tables from '../tables';

type GetSecretPermissionsParams = {
  resourceUri: string;
  permissionType: PermissionType;
};

export async function getSecretPermissions({
  resourceUri,
  permissionType,
}: GetSecretPermissionsParams): Promise<PermissionRecord[]> {
  const data = await tables();

  const q: DynamoDbQuery = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    FilterExpression:
      '#type = :type AND attribute_exists(secret) AND secret <> :null',
    ExpressionAttributeValues: {
      ':resource_uri': resourceUri,
      ':type': permissionType,
      ':null': 'null',
    },
    ExpressionAttributeNames: {
      '#type': 'type',
    },
  };

  return (await data.permissions.query(q)).Items;
}
