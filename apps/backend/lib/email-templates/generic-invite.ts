import salutation from './utils/salutation';

export default ({ from, to, resource, resourceName, inviteAcceptLink }: Record<string, any>) => ({
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
