import { DynamoDbQuery } from '@decipad/backendtypes';
import tables from '../tables';

export async function removeAllPermissionsFor(resource: string): Promise<void> {
  const data = await tables();
  let lastKey;

  do {
    const q: DynamoDbQuery = {
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': resource,
      },
    };

    if (lastKey) {
      q.ExclusiveStartKey = lastKey;
    }

    const permissions = await data.permissions.query(q);
    lastKey = permissions.LastEvaluatedKey;

    for (const perm of permissions.Items) {
      await data.permissions.delete({ id: perm.id });
    }
  } while (lastKey);
}
