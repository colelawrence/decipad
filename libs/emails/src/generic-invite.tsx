import { User } from '@decipad/interfaces';
import { render } from '@react-email/render';
import { GenericInvite } from '@decipad/email-templates';
import { EmailGenerator } from './types';

const genericInvite: EmailGenerator<{
  from: User;
  to: User;
  resource: { type: string; humanName: string };
  resourceName: string;
  inviteAcceptLink: string;
}> = ({ from, to, resource, resourceName, inviteAcceptLink }) => ({
  subject: `Decipad: ${from.name} invites you to a ${resource.humanName}`,

  body: render(
    <GenericInvite
      resourceType={resource.humanName}
      resourceName={resourceName}
      resourceUrl={inviteAcceptLink}
      inviterName={from.name || 'Unknown'}
      inviterEmail={from.email}
      inviteeName={to.name || 'Unknown'}
      inviteeEmail={to.email}
    />
  ),
});
export default genericInvite;
