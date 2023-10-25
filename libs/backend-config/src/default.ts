// these are the values that are good for the development sandbox
// there are no important secrets here, so you can relax.
// we need this to be JS because of our build script, which injects default
// values into the builkd targets.
const defaultEnvValues = {
  APP_ROOT_PATH: '/',
  AWS_REGION: 'eu-west-2',

  DECI_FROM_EMAIL_ADDRESS: 'Decipad<info@decipad.com>',
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

  DECI_MAX_ATTACHMENT_SIZE: '1000000',
  DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS: '300',
  DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS: '300',

  // Third-party auth:
  DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS: (365 * 60 * 60 * 24).toString(), // one year,
  GITHUB_CLIENT_ID: '724d4d510a5e7301d70d',
  GITHUB_CLIENT_SECRET: '288ea1dc0c15a556524042cf2691f54faf393c69',
  DECI_GOOGLESHEETS_API_KEY: 'AIzaSyAUUz2i17q5GS-RucohCV0H2rhn63QciIY',
  DECI_GOOGLESHEETS_CLIENT_ID:
    '549815184000-f5fot2gqf2v0215i5jai3p4arcmujlj1.apps.googleusercontent.com',
  DECI_GOOGLESHEETS_CLIENT_SECRET: 'HLOZB7KuJlaQHF2GE1Tmnmov',

  JWT_MAX_AGE: '2592000', // 1 month (30 * 24 * 60 * 60)
  JWT_SECRET: 'catwalklrjqwr92309endasjkdn023eqhjdskajhaskj',

  OPENAI_API_KEY: 'ask the dev team',

  NEXTAUTH_URL: 'http://localhost:3000/api/auth',

  SENTRY_DSN: '',

  DISCORD_PUBLIC_KEY: 'LjZeWHYTwsps07NJfu1J',
  DISCORD_APP_ID: 'discord app id',

  REACT_APP_ANALYTICS_WRITE_KEY: '',

  // Tests-related
  DECI_TEST_USER_SECRET: '8VZFow-238xbFlfKJewgmPLdwIqEPhQvpb7voaWmeI',

  INTERCOM_SECRET_ID: '',

  STRIPE_WEBHOOK_SECRET: 'whsec_5OFckdB3UAvB6IzPG3FRZ9693S46b5SE',
  STRIPE_API_KEY:
    'pk_test_51J3IJaB0kCiHMJmLLVOuP3EvQydQUapNq7cUlEJs7WxIuv6AOFix7iz7urY9vJu8mQR0q6D9KIRb5zbf9184ykzJ00w67LiHvu',
  STRIPE_SECRET_KEY:
    'sk_test_51J3IJaB0kCiHMJmL1UViJeQBjwEvCoDKBEtN2xLyCpjEKB6s6FF3PGcwNC4G5xCZSCtqbOgneM9vORbwrrRh29t200ySTx8I57',

  REACT_APP_STRIPE_PAYMENT_LINK:
    'https://buy.stripe.com/test_7sI16U2EX4xcgVO000',
  REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK:
    'https://billing.stripe.com/p/login/test_3cseXB8O17p9eMo000',

  NOTION_TOKEN: 'secret_g0S3h99PyM20tZ6oxPonoQ66xwxxmUtNaaDTHVKFPFn',

  // Internal AI feedback
  DISCORD_FEEDBACK_CHANNEL_TOKEN:
    'rJLUz9bxS-oRyvOEH5dW8ZBM-9qi4Wme0do7JJ_T7Dpg0ZLQo4-pyNCTy8TmhWg9uyJB',
  DISCORD_FEEDBACK_CHANNEL_ID: '1164225554824826961',
};

export type SupportedEnvKey = keyof typeof defaultEnvValues;
export function defaultEnv(key: SupportedEnvKey): string {
  return defaultEnvValues[key];
}
