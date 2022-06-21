// these are the values that are good for the development sandbox
// there are no important secrets here, so you can relax.
// we need this to be JS because of our build script, which injects default
// values into the builkd targets.
const defaultEnvValues = {
  APP_ROOT_PATH: '/',
  AWS_REGION: 'eu-west-2',

  DECI_FROM_EMAIL_ADDRESS: 'info@decipad.com',
  DECI_APP_URL_BASE: 'http://localhost:3000',
  DECI_PORT: '3000',

  DECI_SES_ACCESS_KEY_ID: 'noneofyourbusiness',
  DECI_SES_SECRET_ACCESS_KEY: 'noneofyourbusiness',

  DECI_S3_ENDPOINT: 'localhost:4568',
  DECI_S3_ACCESS_KEY_ID: 'S3RVER',
  DECI_S3_SECRET_ACCESS_KEY: 'S3RVER',
  DECI_S3_PADS_BUCKET: 'pads',
  DECI_S3_ATTACHMENTS_BUCKET: 'attachments',
  DECI_INVITE_EXPIRATION_SECONDS: '604800',

  DECI_KEY_VALIDATION_EXPIRATION_SECONDS: '2592000',

  DECI_MAX_ATTACHMENT_SIZE: '100000',
  DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS: '300',
  DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS: '300',

  // Third-party auth:
  DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS: (60 * 60 * 24 * 30).toString(), // one month,
  GITHUB_CLIENT_ID: '724d4d510a5e7301d70d',
  GITHUB_CLIENT_SECRET: '288ea1dc0c15a556524042cf2691f54faf393c69',
  DECI_GOOGLESHEETS_API_KEY: 'AIzaSyC1rl_w_G-RMx6hJJZRJ9rSbyD00POLIEM',
  DECI_GOOGLESHEETS_CLIENT_ID:
    '549815184000-f5fot2gqf2v0215i5jai3p4arcmujlj1.apps.googleusercontent.com',
  DECI_GOOGLESHEETS_CLIENT_SECRET: 'HLOZB7KuJlaQHF2GE1Tmnmov',

  JWT_MAX_AGE: '2592000', // 1 month (30 * 24 * 60 * 60)
  JWT_SECRET: 'catwalklrjqwr92309endasjkdn023eqhjdskajhaskj',

  NEXTAUTH_URL: 'http://localhost:3000/api/auth',

  SENTRY_DSN: '',

  DISCORD_PUBLIC_KEY: 'LjZeWHYTwsps07NJfu1J',
  DISCORD_APP_ID: 'discord app id',

  // Tests-related
  DECI_TEST_USER_SECRET: '8VZFow-238xbFlfKJewgmPLdwIqEPhQvpb7voaWmeI',
};

export type SupportedEnvKey = keyof typeof defaultEnvValues;
export function defaultEnv(key: SupportedEnvKey): string {
  return defaultEnvValues[key];
}
