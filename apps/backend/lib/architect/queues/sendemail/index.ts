import templates from '../../../email-templates';
import sendEmail from '../../../services/send-email';
import handle from '../../../queues/handler';

type SendEmailArgs = {
  template: keyof typeof templates;
} & Record<string, any>;

export const handler = handle(handleSendEmail);

const inTesting = !!process.env.JEST_WORKER_ID;

async function handleSendEmail({
  template: templateName,
  ...params
}: SendEmailArgs) {
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
}
