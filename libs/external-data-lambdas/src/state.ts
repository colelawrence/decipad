import { z } from 'zod';

const oauthStateValidator = z.object({
  // Where are we taking the user back to, once everything
  // is finished? Not to be confused with `redirect_uri`.
  completionUrl: z.string().url(),

  externalDataId: z.string(),
});

export type OAuthState = z.infer<typeof oauthStateValidator>;

export function encodeState(state: OAuthState): string {
  const validatedState = oauthStateValidator.safeParse(state);

  if (!validatedState.success) {
    throw new Error(
      `state did not parse successfully: ${validatedState.error.message}`
    );
  }

  return Buffer.from(JSON.stringify(validatedState.data)).toString('base64');
}

export function decodeState(state: string): OAuthState {
  const buffer = Buffer.from(state, 'base64').toString('utf8');

  let json;

  try {
    json = JSON.parse(buffer);
  } catch (e) {
    throw new Error('Could not parse JSON from state');
  }

  const validatedState = oauthStateValidator.safeParse(json);
  if (!validatedState.success) {
    throw new Error(
      `state did not parse successfully: ${validatedState.error.message}`
    );
  }

  return validatedState.data;
}
