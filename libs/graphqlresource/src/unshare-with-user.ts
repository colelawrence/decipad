import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { UserInputError } from 'apollo-server-lambda';
import { track } from '@decipad/backend-analytics';
import { expectAuthenticatedAndAuthorized, loadUser } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';

export function unshareWithUser<
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
>['unshareWithUser'] {
  return async function unshareAndReturnUpdatedResource(_, args, context) {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const { permissions } = await tables();
    await permissions.delete({
      id: `/users/${args.userId}/roles/null${resources[0]}`,
    });

    const data = await resourceType.dataTable();
    const updatedRecord = await data.get({ id: args.id });
    if (!updatedRecord) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const user = loadUser(context);

    await track(
      context.event,
      {
        userId: user?.id,
        event: `unshared with user`,
        properties: {
          resourceType: resourceType.humanName,
          resourceId: args.id,
        },
      },
      context
    );

    return resourceType.toGraphql(updatedRecord);
  };
}
