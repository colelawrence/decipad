import { User } from '@decipad/interfaces';
import { EmailGenerator } from './types';
import salutation from './utils/salutation';

const workspaceInvite: EmailGenerator<{
  from: User;
  to: User;
  workspace: { name: string };
  inviteAcceptLink: string;
}> = ({ from, to, workspace, inviteAcceptLink }) => ({
  subject: `${from.name} invites you to workspace "${workspace.name}"`,
  body: `${salutation(to)},

${from.name} has invited you to join the workspace "${workspace.name}".

You can accept it by clicking on the following link:

${inviteAcceptLink}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Decipad team.
`,
});
export default workspaceInvite;
