import { UserInputError } from 'apollo-server-lambda';
import { nanoid } from 'nanoid';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
  PermissionType,
} from '@decipad/backendtypes';
import {
  create as createResourcePermission,
  getSecretPermissions,
} from '@decipad/services/permissions';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { Resource } from './';

export type ShareWithSecretArgs = {
  id: ID;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithSecretFunction = (
  _: any,
  args: ShareWithSecretArgs,
  context: GraphqlContext
) => Promise<string>;

export function shareWithSecret<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ShareWithSecretFunction {
  return async function (
    _: any,
    args: ShareWithSecretArgs,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${args.id}`;

    await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
    const actorUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const existingPermissions = await getSecretPermissions({
      resourceUri: resource,
      permissionType: args.permissionType,
    });

    if (existingPermissions.length > 0) {
      return existingPermissions[0].secret!;
    }

    const permission: Parameters<typeof createResourcePermission>[0] = {
      secret: nanoid(),
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
    return permission.secret!;
  };
}
