import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { create as createResourcePermission } from '@decipad/services/permissions';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';

export function shareWithRole<
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
>['shareWithRole'] {
  return async (_, args, context) => {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const actingUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const permission: Parameters<typeof createResourcePermission>[0] = {
      roleId: args.roleId,
      givenByUserId: actingUser.id,
      resourceUri: resources[0],
      parentResourceUri: resources[1],
      type: args.permissionType,
      canComment: false,
    };
    if (resourceType.parentResourceUriFromRecord) {
      permission.parentResourceUri =
        resourceType.parentResourceUriFromRecord(record);
    }

    await createResourcePermission(permission);
    return true;
  };
}
