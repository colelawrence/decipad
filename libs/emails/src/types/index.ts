// This is in a type definition, stupid lint rule...
/* eslint-disable no-unused-vars */

import { PromiseOrType } from '@decipad/utils';

export type EmailGenerator<
  A extends Record<string, unknown> = Record<never, never>
> = (
  args: A
) => PromiseOrType<{ readonly subject: string; readonly body: string }>;

// TODO actually use those types where we use the email templates and pass arguments to them
