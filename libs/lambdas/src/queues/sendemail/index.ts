import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { track } from '@decipad/backend-analytics';
import templates from '@decipad/emails';
import { sendEmail } from '@decipad/services/email';
import { captureException } from '@decipad/backend-trace';
import handle from '../handle';
import { debug } from '../../debug';

// TODO restructure and use input validation to check parameters are correct for the given template, making it possible to type without any
/* eslint-disable @typescript-eslint/no-explicit-any */

type SendEmailArgs = {
  template: keyof typeof templates;
} & Record<string, any>;

const inTesting = !!process.env.JEST_WORKER_ID;

async function handleSendEmail(
  { template: templateName, ...params }: SendEmailArgs,
  event: APIGatewayProxyEventV2
) {
  if (inTesting) {
    return;
  }

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Could not find template with name ${templateName}`);
  }

  const { subject, body } = template(params as any);

  try {
    await sendEmail({
      to: params.email || params.to.email,
      body,
      subject,
    });
    debug('email sent', params);
    await track(event, { event: 'email sent', properties: params });
  } catch (err) {
    await captureException(err as Error);
    console.error('Error sending email', err);
  }
}

export const handler = handle(handleSendEmail);
