module.exports = ({ name, validationLink }) => ({
  subject: `Validate your e-mail address`,
  body: `${name ? `Dear ${name}` : 'Hi'},

You have recently created an account in Deci.

To activate it you need to validate your email address by clicking in this link:

${validationLink}

If it wasn't you that created the account, you can safely ignore this e-mail.

Sincerely,

The Deci team.
`,
});
