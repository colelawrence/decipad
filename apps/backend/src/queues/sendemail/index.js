const arc = require('@architect/functions');
const templates = require('@architect/shared/email-templates');
const sendEmail = require('@architect/shared/services/send-email');

exports.handler = arc.queues.subscribe(handler);

const inTesting = !!process.env.JEST_WORKER_ID;

async function handler({ template: templateName, ...params }) {
  if (inTesting) {
    return;
  }

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Could not find template with name ${templateName}`);
  }

  const { subject, body } = template(params);

  await sendEmail({
    to: params.email || params.to.email,
    body,
    subject,
  });

  return;
}
