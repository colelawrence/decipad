import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { check } from './authorization';
import { Resource } from './';

export type UnshareWithUserArgs = {
  id: ID;
  userId: ID;
};

export type UnshareWithUserFunction = (
  _: any,
  args: UnshareWithUserArgs,
  context: GraphqlContext
) => Promise<void>;

export function unshareWithUser<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): UnshareWithUserFunction {
  return async function (
    _: any,
    args: UnshareWithUserArgs,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    await check(resource, context, 'ADMIN');
    const data = await tables();
    await data.permissions.delete({
      id: `/users/${args.userId}/roles/null${resource}`,
    });
  };
}
