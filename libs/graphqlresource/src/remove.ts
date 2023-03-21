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
import { getResources } from './utils/getResources';

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
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const data = await resourceType.dataTable();
    await Promise.all([
      data.delete({ id: args.id }),
      removeAllPermissionsFor(resources[0]),
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
