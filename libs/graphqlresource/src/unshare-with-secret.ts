import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';
import { getDefined } from '@decipad/utils';

export function unshareWithSecret<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ResourceResolvers<
  RecordT,
  GraphqlT,
  CreateInputT,
  UpdateInputT
>['unshareWithSecret'] {
  return async function doUnshareWithSecret(_, args, context) {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const data = await tables();
    const permissions = (
      await Promise.all(
        resources.map(
          async (resource) =>
            (
              await data.permissions.query({
                IndexName: 'byResourceAndSecret',
                KeyConditionExpression:
                  'resource_uri = :resource AND secret = :secret',
                ExpressionAttributeValues: {
                  ':resource': resource,
                  ':secret': getDefined(
                    (args as unknown as { secret: string }).secret
                  ),
                },
              })
            ).Items
        )
      )
    ).flat(1);

    await Promise.all(
      permissions.map(async (permission) => {
        await data.permissions.delete({ id: permission.id });
      })
    );

    return true;
  };
}
