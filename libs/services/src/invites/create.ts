import { ID, PermissionType, User } from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import { queues } from '@architect/functions';
import tables from '@decipad/tables';
import { auth as authConfig, app as appConfig } from '@decipad/config';
import { timestamp } from '@decipad/services/utils';
import { createVerifier } from '../authentication';

export interface INotifyInviteArguments {
  user: User;
  invitedByUser: User;
  isRegistered: boolean;
  email: string;

  resourceType: { humanName: string };
  resourceName: string;
  resourceLink: string;
}

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

export async function notify(args: INotifyInviteArguments) {
  const acceptLink = args.isRegistered
    ? args.resourceLink
    : await generateAuthLink(args);

  await queues.publish({
    name: 'sendemail',
    payload: {
      template: 'generic-invite',
      from: args.invitedByUser,
      to: args.user,
      resource: args.resourceType,
      resourceName: args.resourceName,
      inviteAcceptLink: acceptLink,
    },
  });
}

async function generateAuthLink(args: INotifyInviteArguments) {
  const { jwt: jwtConfig, inviteExpirationSeconds } = authConfig();
  const { urlBase } = appConfig();

  const verifier = createVerifier({
    secret: jwtConfig.secret,
    baseUrl: urlBase,
  });

  const { loginLink } = await verifier.createStandaloneVerificationToken({
    email: args.email,
    resourceLink: args.resourceLink,
    expirationSeconds: inviteExpirationSeconds,
  });

  return loginLink;
}
