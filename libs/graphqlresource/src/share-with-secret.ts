import { UserInputError } from 'apollo-server-lambda';
import { nanoid } from 'nanoid';
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

    const actorUser = await isAuthenticatedAndAuthorized(
      resource,
      context,
      'ADMIN'
    );

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
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
