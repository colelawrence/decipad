import {
  ConcreteRecord,
  GraphqlContext,
  GraphqlObjectType,
  ID,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { Resource } from '.';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';

export type UnshareWithSecretArgs = {
  id: ID;
  secret: string;
};

export type UnshareWithSecretFunction = (
  _: unknown,
  args: UnshareWithSecretArgs,
  context: GraphqlContext
) => Promise<boolean>;

export function unshareWithSecret<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): UnshareWithSecretFunction {
  return async function doUnshareWithSecret(
    _: unknown,
    args: UnshareWithSecretArgs,
    context: GraphqlContext
  ) {
    const resources = await getResources(resourceType, args.id);
    await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
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
                  ':secret': args.secret,
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
