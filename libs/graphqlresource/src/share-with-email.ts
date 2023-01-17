import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  PermissionType,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { create as createInvite } from '@decipad/services/invites';
import { create as createUser } from '@decipad/services/users';
import tables from '@decipad/tables';
import { expectAuthenticatedAndAuthorized, requireUser } from './authorization';
import { Resource } from '.';
import { ShareWithUserFunction } from './share-with-user';

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
  shareWithUser: ShareWithUserFunction
) => ShareWithEmailFunction<RecordT>) => {
  return (shareWithUser: ShareWithUserFunction) =>
    async (
      _: unknown,
      args: ShareWithEmailArgs,
      context: GraphqlContext
    ): Promise<RecordT> => {
      const resource = `/${resourceType.resourceTypeName}/${args.id}`;
      await expectAuthenticatedAndAuthorized(resource, context, 'ADMIN');
      const actingUser = requireUser(context);

      const data = await resourceType.dataTable();
      const record = await data.get({ id: args.id });
      if (!record) {
        throw new UserInputError(`no such ${resourceType.humanName}`);
      }

      const emailKeyId = `email:${args.email}`;
      const { userkeys } = await tables();
      const emailKey = await userkeys.get({ id: emailKeyId });
      if (emailKey) {
        await shareWithUser(
          _,
          {
            id: args.id,
            userId: emailKey.user_id,
            permissionType: args.permissionType,
            canComment: args.canComment,
          },
          context
        );

        return record;
      }

      const newUser = (
        await createUser({
          name: args.email,
          email: args.email,
        })
      ).user;

      const invite: Parameters<typeof createInvite>[0] = {
        resourceType: resourceType.resourceTypeName,
        resourceId: args.id,
        resourceName: resourceType.humanName,
        user: newUser,
        email: args.email,
        invitedByUser: actingUser,
        permission: args.permissionType,
        canComment: !!args.canComment,
      };
      if (resourceType.parentResourceUriFromRecord) {
        invite.parentResourceUri =
          resourceType.parentResourceUriFromRecord(record);
      }
      await createInvite(invite);

      return record;
    };
};
