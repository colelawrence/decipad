import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { Resource } from './';

export type UnshareWithRoleArgs = {
  id: ID;
  roleId: ID;
};

export type UnshareWithRoleFunction = (
  _: any,
  args: UnshareWithRoleArgs,
  context: GraphqlContext
) => Promise<void>;

export function unshareWithRole<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): UnshareWithRoleFunction {
  return async function (
    _: any,
    args: UnshareWithRoleArgs,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const data = await tables();
    await data.permissions.delete({
      id: `/users/null/roles/${args.roleId}${resource}`,
    });
  };
}
