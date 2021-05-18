const salutation = require('./utils/salutation');

module.exports = ({ from, to, workspace, inviteAcceptLink }) => ({
  subject: `${from.name} invites you to workspace "${workspace.name}"`,
  body: `${salutation(to)},

${from.name} has invited you to join the workspace "${workspace.name}".

You can accept it by clicking on the following link:

${inviteAcceptLink}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`,
});
