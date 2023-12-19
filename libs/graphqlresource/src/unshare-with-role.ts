import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';

export function unshareWithRole<
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
>['unshareWithRole'] {
  return async (_, args, context) => {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const data = await tables();
    await data.permissions.delete({
      id: `/users/null/roles/${args.roleId}${resources[0]}`,
    });
    return true;
  };
}
