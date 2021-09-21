import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import { create as createResourcePermission } from '@decipad/services/permissions';
import { isAuthenticatedAndAuthorized } from './authorization';
import { Resource } from './';

export type ShareWithUserArgs = {
  id: ID;
  userId: ID;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithUserFunction = (
  _: any,
  args: ShareWithUserArgs,
  context: GraphqlContext
) => Promise<void>;

export function shareWithUser<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ShareWithUserFunction {
  return async function (
    _: any,
    args: ShareWithUserArgs,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;
    const actorUser = await isAuthenticatedAndAuthorized(resource, context, 'ADMIN');

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const permission: Parameters<typeof createResourcePermission>[0] = {
      userId: args.userId,
      givenByUserId: actorUser.id,
      resourceUri: resource,
      type: args.permissionType,
      canComment: !!args.canComment,
    };
    if (resourceType.parentResourceUriFromRecord) {
      permission.parentResourceUri =
        resourceType.parentResourceUriFromRecord(record);
    }

    await createResourcePermission(permission);
  };
}
