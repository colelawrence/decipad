import {
  ConcreteRecord,
  GraphqlContext,
  GraphqlObjectType,
  ID,
  PermissionType,
} from '@decipad/backendtypes';
import {
  create as createResourcePermission,
  getSecretPermissions,
} from '@decipad/services/permissions';
import { nanoid } from 'nanoid';
import { UserInputError } from 'apollo-server-lambda';
import { Resource } from '.';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { getResources } from './utils/getResources';

export type ShareWithSecretArgs = {
  id: ID;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithSecretFunction = (
  _: unknown,
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
  return async function shareWithSecret(
    _: unknown,
    args: ShareWithSecretArgs,
    context: GraphqlContext
  ) {
    const resources = await getResources(resourceType, args.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const actorUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const existingPermissions = await getSecretPermissions({
      resourceUri: resources[0],
      permissionType: args.permissionType,
    });

    if (existingPermissions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return existingPermissions[0].secret!;
    }

    const secret = nanoid();
    console.log(
      `about to create secret for resource resource ${resources[0]}: ${secret}`
    );
    const permission: Parameters<typeof createResourcePermission>[0] = {
      secret,
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return permission.secret!;
  };
}
