module.exports = ({ from, to, team, inviteAcceptLink }) => ({
  subject: `${from.name} invites you to team ${team.name}`,
  body: `Dear ${to.name},

${from.name} has invited you to join the team ${team.name}.

You can accept it by clicking on the following link:

${inviteAcceptLink}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`,
});
