import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { removeAllPermissionsFor } from '@decipad/services/permissions';
import { isAuthenticatedAndAuthorized } from './authorization';
import { Resource } from './';

export type RemoveFunction = (
  _: any,
  args: { id: ID },
  context: GraphqlContext
) => Promise<void>;

export function remove<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): RemoveFunction {
  return async function (_: any, args: { id: ID }, context: GraphqlContext) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    await isAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const data = await resourceType.dataTable();
    await Promise.all([
      data.delete({ id: args.id }),
      removeAllPermissionsFor(resource),
    ]);
  };
}
