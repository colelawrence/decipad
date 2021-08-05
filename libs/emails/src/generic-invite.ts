import { User } from '@decipad/interfaces';
import { EmailGenerator } from './types';
import salutation from './utils/salutation';

const genericInvite: EmailGenerator<{
  from: User;
  to: User;
  resource: { type: string };
  resourceName: string;
  inviteAcceptLink: string;
}> = ({ from, to, resource, resourceName, inviteAcceptLink }) => ({
  subject: `${from.name} invites you to a ${resource.type}`,
  body: `${salutation(to)},

${from.name} has shared a ${resource.type} named "${resourceName}".

You can accept it by clicking on the following link:

${inviteAcceptLink}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`,
});
export default genericInvite;
