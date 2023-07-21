import { queues } from '@architect/functions';
import { timestamp } from '@decipad/backend-utils';
import { ID, PermissionType, User } from '@decipad/backendtypes';
import { app as appConfig, auth as authConfig } from '@decipad/config';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
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

  if (process.env.ARC_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('invitation link:\n\n', acceptLink, '\n\n');
  }

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

export async function generateAuthLink(args: INotifyInviteArguments) {
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

  let signUpMessage;
  const { name } = args.invitedByUser;

  if (name && name !== '' && !name.includes('@')) {
    signUpMessage = `${name} invited you to workspace ${args.resourceName}`;
  } else {
    signUpMessage = `You have been invited to ${args.resourceName}`;
  }
  const params = new URLSearchParams({
    email: args.email,
    // invitedBy: args.invitedByUser.email || args.invitedByUser.name,
    message: signUpMessage,
    redirect: loginLink,
  });

  return `${urlBase}/w?${params.toString()}`;
}
