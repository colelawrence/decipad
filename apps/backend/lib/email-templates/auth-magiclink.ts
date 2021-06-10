export default ({ url }: Record<string, any>) => ({
  subject: `Deci: Sign in`,
  body: `Hello,

You have recently asked to sign into Deci.

To be able to do that, you can click on this link:

${url}

If it wasn't you that initiated this, you can safely ignore this e-mail.

Whatever you do, please don't forward this e-mail to anyone.

Sincerely,

The Deci team.
`,
});
