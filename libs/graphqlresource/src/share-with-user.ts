import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import { create as createResourcePermission } from '@decipad/services/permissions';
import { UserInputError } from 'apollo-server-lambda';
import tables from '@decipad/tables';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { Resource } from '.';
import { getResources } from './utils/getResources';

export type ShareWithUserArgs = {
  id: ID;
  userId: ID;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithUserFunction<RecordT extends ConcreteRecord> = (
  _: unknown,
  args: ShareWithUserArgs,
  context: GraphqlContext
) => Promise<RecordT>;

export function shareWithUser<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ShareWithUserFunction<RecordT> {
  return async (
    _: unknown,
    args: ShareWithUserArgs,
    context: GraphqlContext
  ) => {
    const resources = await getResources(resourceType, args.id);
    await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    const actorUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const { permissions } = await tables();
    const existingPermissions = (
      await permissions.query({
        IndexName: 'byResourceAndUser',
        KeyConditionExpression:
          'resource_uri = :resource_uri and user_id = :user_id',
        ExpressionAttributeValues: {
          ':resource_uri': resources[0],
          ':user_id': args.userId,
        },
      })
    ).Items;
    if (existingPermissions.length > 0) {
      const [permission] = existingPermissions;
      if (permission.type !== args.permissionType) {
        await permissions.put({
          ...permission,
          type: args.permissionType,
        });
      }
    } else {
      const permission: Parameters<typeof createResourcePermission>[0] = {
        userId: args.userId,
        givenByUserId: actorUser.id,
        resourceUri: resources[0],
        parentResourceUri: resources[1],
        type: args.permissionType,
        canComment: !!args.canComment,
      };
      if (resourceType.parentResourceUriFromRecord) {
        permission.parentResourceUri =
          resourceType.parentResourceUriFromRecord(record);
      }

      await createResourcePermission(permission);
    }

    return record;
  };
}
