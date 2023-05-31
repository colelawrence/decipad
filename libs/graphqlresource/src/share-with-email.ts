import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  PermissionType,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { notify as notifyInvitee } from '@decipad/services/invites';
import { create as createUser } from '@decipad/services/users';
import { app } from '@decipad/config';
import tables from '@decipad/tables';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { Resource } from '.';
import { ShareWithUserFunction } from './share-with-user';
import { getResources } from './utils/getResources';

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
  shareWithUser: ShareWithUserFunction<RecordT>
) => ShareWithEmailFunction<RecordT>) => {
  return (shareWithUser: ShareWithUserFunction<RecordT>) =>
    async (
      _: unknown,
      args: ShareWithEmailArgs,
      context: GraphqlContext
    ): Promise<RecordT> => {
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
            await createUser({
              email,
              name: email,
            })
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
          canComment: args.canComment,
        },
        context
      );

      await notifyInvitee({
        user,
        email,
        invitedByUser: actingUser,
        isRegistered: registeredUserId != null,
        resourceType,
        resourceLink: getResourceUrl(resourceType.resourceTypeName, args.id),
        resourceName:
          'name' in record ? record.name : `<Random ${resourceType.humanName}>`,
      });

      await track({
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

      return record;
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
