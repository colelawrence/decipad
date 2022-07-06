import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { removeAllPermissionsFor } from '@decipad/services/permissions';
import { track } from '@decipad/backend-analytics';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { Resource } from '.';

export type RemoveFunction = (
  _: unknown,
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
  return async function remove(
    _: unknown,
    args: { id: ID },
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const data = await resourceType.dataTable();
    await Promise.all([
      data.delete({ id: args.id }),
      removeAllPermissionsFor(resource),
    ]);

    await track(
      {
        userId: context.user?.id,
        event: `${resourceType.humanName} removed`,
      },
      context
    );
  };
}
