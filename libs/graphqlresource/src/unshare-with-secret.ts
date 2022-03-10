import {
  ConcreteRecord,
  GraphqlContext,
  GraphqlObjectType,
  ID,
} from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { Resource } from './';
import { expectAuthenticatedAndAuthorized } from './authorization';

export type UnshareWithSecretArgs = {
  id: ID;
  secret: string;
};

export type UnshareWithSecretFunction = (
  _: any,
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
  return async function (
    _: any,
    args: UnshareWithSecretArgs,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const data = await tables();
    const permissions = await data.permissions.query({
      IndexName: 'byResourceAndSecret',
      KeyConditionExpression:
        'resource_uri = :resource_uri AND secret = :secret',
      ExpressionAttributeValues: {
        ':resource_uri': resource,
        ':secret': args.secret,
      },
    });

    await Promise.all(
      permissions.Items.map(async (permission) => {
        await data.permissions.delete({ id: permission.id });
      })
    );

    return true;
  };
}
