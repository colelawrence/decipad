import { ID, PermissionType, User } from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import { queues } from '@architect/functions';
import tables from '@decipad/tables';
import { auth as authConfig, app as appConfig } from '@decipad/config';
import timestamp from '../utils/timestamp';

export interface ICreateInviteArguments {
  resourceType: string;
  resourceId: ID;
  resourceName: string;
  user: User;
  email: string;
  invitedByUser: User;
  permission: PermissionType;
  canComment: boolean;
  parentResourceUri?: string;
}

export async function create(args: ICreateInviteArguments) {
  const data = await tables();
  const resource = `/${args.resourceType}/${args.resourceId}`;
  const { inviteExpirationSeconds } = authConfig();
  const newInvite = {
    id: nanoid(),
    permission_id: `/users/${args.user.id}/roles/null${resource}`,
    resource_uri: resource,
    resource_type: args.resourceType,
    resource_id: args.resourceId,
    parent_resource_uri: args.parentResourceUri,
    user_id: args.user.id,
    role_id: 'null',
    invited_by_user_id: args.invitedByUser.id,
    permission: args.permission,
    email: args.email,
    can_comment: args.canComment,
    expires_at: timestamp() + inviteExpirationSeconds,
  };
  await data.invites.put(newInvite);

  const { urlBase } = appConfig();

  const inviteAcceptLink = `${urlBase}/api/invites/${newInvite.id}/accept`;

  const isLocal = urlBase === 'http://localhost:3000';

  if (isLocal) {
    // eslint-disable-next-line no-console
    console.info('Invite link:', inviteAcceptLink);
  }

  await queues.publish({
    name: 'sendemail',
    payload: {
      template: 'generic-invite',
      from: args.invitedByUser,
      to: args.user,
      resource,
      inviteAcceptLink,
      resourceName: args.resourceName,
    },
  });
}
