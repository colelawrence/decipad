import {
  Resource,
  DynamoDbQuery,
  PermissionRecord,
} from '@decipad/backendtypes';
import { uniqBy } from 'lodash';
import tables from '@decipad/tables';

type QueryAccessibleResourcesParams = {
  userId: string;
  resourceType: string;
  parentResourceUri: string | null;
};

export async function queryAccessibleResources({
  userId,
  resourceType,
  parentResourceUri = null,
}: QueryAccessibleResourcesParams): Promise<Resource[]> {
  const data = await tables();

  const q: DynamoDbQuery = {
    IndexName: 'byUserId',
    KeyConditionExpression:
      'user_id = :user_id and resource_type = :resource_type',
    ExpressionAttributeValues: {
      ':user_id': userId,
      ':resource_type': resourceType,
    },
  };

  if (parentResourceUri) {
    q.FilterExpression = 'parent_resource_uri = :parent_resource_uri';
    if (!q.ExpressionAttributeValues) {
      q.ExpressionAttributeValues = {};
    }
    q.ExpressionAttributeValues[':parent_resource_uri'] = parentResourceUri;
  }

  const permissions = (await data.permissions.query(q)).Items;

  return uniqBy(permissions.map(permissionToResource), 'id') as Resource[];
}

function permissionToResource(permission: PermissionRecord): Resource {
  return {
    id: permission.resource_id,
    type: permission.resource_type,
  };
}
