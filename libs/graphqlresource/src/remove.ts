import type { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import type { Resource, ResourceResolvers } from './types';
import { removeAllPermissionsFor } from '@decipad/services/permissions';
import { track } from '@decipad/backend-analytics';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';

export function remove<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ResourceResolvers<RecordT, GraphqlT, CreateInputT, UpdateInputT>['remove'] {
  return async function remove(_, args, context) {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const data = await resourceType.dataTable();
    const record = await data.get(args);
    if (record == null) {
      throw new Error('Could not find record, and therefore cannot delete it.');
    }

    await Promise.all([
      data.delete({ id: args.id }),
      removeAllPermissionsFor(resources[0]),
    ]);

    await track(
      context.event,
      {
        userId: context.user?.id,
        event: `${resourceType.humanName} removed`,
      },
      context
    );

    if (resourceType.afterDeletion != null) {
      await resourceType.afterDeletion(record);
    }

    return true;
  };
}
