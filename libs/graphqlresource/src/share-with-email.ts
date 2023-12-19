import { ID, ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { notify as notifyInvitee } from '@decipad/services/invites';
import { create as createUser } from '@decipad/services/users';
import { app } from '@decipad/backend-config';
import tables from '@decipad/tables';
import { track, identify } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { getResources } from './utils/getResources';
import { GraphqlContext, PermissionType } from '@decipad/graphqlserver-types';
import { Resource, ResourceResolvers } from './types';

export type ShareWithEmailArgs = {
  id: ID;
  email: string;
  permissionType: PermissionType;
  canComment?: boolean;
};

export type ShareWithEmailFunction<RecordT extends ConcreteRecord> = (
  _: unknown,
  args: ShareWithEmailArgs,
  context: GraphqlContext
) => Promise<RecordT>;

export const shareWithEmail = <
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ((
  shareWithUser: ResourceResolvers<
    RecordT,
    GraphqlT,
    CreateInputT,
    UpdateInputT
  >['shareWithUser']
) => ResourceResolvers<
  RecordT,
  GraphqlT,
  CreateInputT,
  UpdateInputT
>['shareWithEmail']) => {
  return (shareWithUser) => async (_, args, context) => {
    if (!resourceType.skipPermissions) {
      const resources = await getResources(resourceType, args.id);
      await expectAuthenticatedAndAuthorized(resources, context, 'ADMIN');
    }
    const actingUser = requireUser(context);

    const data = await resourceType.dataTable();
    const record = await data.get({ id: args.id });
    if (!record) {
      throw new UserInputError(`no such ${resourceType.humanName}`);
    }

    const email = args.email.toLowerCase();
    const emailKeyId = `email:${email}`;
    const { userkeys, users } = await tables();
    const emailKey = await userkeys.get({ id: emailKeyId });

    const registeredUserId = emailKey?.user_id;

    if (!email.includes('@')) {
      throw new UserInputError('invalid email');
    }

    if (actingUser.email === email) {
      throw new UserInputError('cannot share with yourself');
    }

    const user = registeredUserId
      ? await users.get({ id: registeredUserId })
      : (
          await createUser(
            {
              email,
              name: email,
            },
            context.event
          )
        ).user;

    if (!user) {
      // Invariant: if we have a registeredUserId, we should have a user
      throw new UserInputError(`no such user ${registeredUserId}`);
    }

    await shareWithUser(
      _,
      {
        id: args.id,
        userId: user.id,
        permissionType: args.permissionType,
      },
      context
    );

    await notifyInvitee(context.event, {
      user,
      email,
      invitedByUser: actingUser,
      isRegistered: registeredUserId != null,
      resourceType,
      resourceLink: getResourceUrl(resourceType.resourceTypeName, args.id),
      resourceName:
        'name' in record ? record.name : `<Random ${resourceType.humanName}>`,
    });
    await identify(context.event, actingUser.id, {
      email: actingUser.email,
      fullName: actingUser.name,
    });
    await track(context.event, {
      event: 'share with email',
      properties: {
        email,
        userId: actingUser.id,
        resourceType: resourceType.humanName,
        resourceId: args.id,
        permissionType: args.permissionType,
        isRegistered: registeredUserId != null,
      },
    });

    return resourceType.toGraphql(record);
  };
};

const resourceTypeNameRootPathComponent: Record<string, string> = {
  workspaces: 'w',
  pads: 'n',
  externaldatasources: 'd',
};

const getResourceUrl = (resourceTypeName: string, resourceId: string) => {
  const rootPathComponent = resourceTypeNameRootPathComponent[resourceTypeName];

  if (!rootPathComponent) {
    throw new Error(
      `getResourceUrl got unknown resource type ${resourceTypeName}`
    );
  }

  return `${app().urlBase}/${rootPathComponent}/${resourceId}`;
};
