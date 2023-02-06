import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import { create as createResourcePermission } from '@decipad/services/permissions';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { Resource } from '.';

export type ShareWithRoleArgs = {
  id: ID;
  roleId: ID;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithRoleFunction = (
  _: unknown,
  args: ShareWithRoleArgs,
  context: GraphqlContext
) => Promise<void>;

export function shareWithRole<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ShareWithRoleFunction {
  return async (
    _: unknown,
    args: ShareWithRoleArgs,
    context: GraphqlContext
  ) => {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;

    await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const actingUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const permission: Parameters<typeof createResourcePermission>[0] = {
      roleId: args.roleId,
      givenByUserId: actingUser.id,
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
