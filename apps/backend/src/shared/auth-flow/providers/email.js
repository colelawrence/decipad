const arc = require('@architect/functions');
let Providers = require('next-auth/providers');
if (!Providers.Email) {
  Providers = Providers.default;
}

module.exports = function EmailProvider() {
  return Providers.Email({
    server: 'mail.decipad.com',
    from: 'info@decipad.com',
    sendVerificationRequest,
  });
};

async function sendVerificationRequest({
  identifier: email,
  url,
  token,
  baseUrl,
}) {
  await arc.queues.publish({
    name: `sendemail`,
    payload: {
      template: 'auth-magiclink',
      email,
      url,
      token,
      baseUrl,
    },
  });
}
