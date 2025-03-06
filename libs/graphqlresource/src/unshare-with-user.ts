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
    if (resourceType.humanName === 'notebook') {
      track(context.event, {
        event: `Removed Notebook Collaborator`,
        userId: user?.id,
        properties: {
          notebook_id: args.id,
          removed_userId: args.userId,
        },
      });
    }
    if (resourceType.humanName === 'workspace') {
      track(context.event, {
        event: `Removed Workspace Seat`,
        userId: user?.id,
        properties: {
          workspace_id: args.id,
          removed_userId: args.userId,
        },
      });
    }
    return resourceType.toGraphql(updatedRecord);
  };
}
