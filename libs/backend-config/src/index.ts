import { z } from 'zod';
import type { S3ClientConfig } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import type { SupportedEnvKey } from './default';
import { defaultEnv } from './default';
import { once } from 'ramda';

export { defaultEnv };

function valueOrDefault(
  key: SupportedEnvKey,
  value: string | undefined
): string {
  if (!value) {
    // empty string or undefined
    return defaultEnv(key);
  }
  return value;
}

// eslint-disable-next-line complexity
function env(name: SupportedEnvKey): string {
  // we make a big dumb switch here so that esbuild can replace the process.env.* lookups with the actual values:
  switch (name) {
    case 'APP_ROOT_PATH':
      return valueOrDefault(name, process.env.APP_ROOT_PATH);
    case 'AWS_REGION':
      return valueOrDefault(name, process.env.AWS_REGION);
    case 'DECI_APP_URL_BASE':
      return valueOrDefault(name, process.env.DECI_APP_URL_BASE);
    case 'DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS':
      return valueOrDefault(
        name,
        process.env.DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS
      );
    case 'DECI_FROM_EMAIL_ADDRESS':
      return valueOrDefault(name, process.env.DECI_FROM_EMAIL_ADDRESS);
    case 'DECI_GOOGLESHEETS_API_KEY':
      return valueOrDefault(name, process.env.DECI_GOOGLESHEETS_API_KEY);
    case 'DECI_GOOGLESHEETS_CLIENT_ID':
      return valueOrDefault(name, process.env.DECI_GOOGLESHEETS_CLIENT_ID);
    case 'DECI_GOOGLESHEETS_CLIENT_SECRET':
      return valueOrDefault(name, process.env.DECI_GOOGLESHEETS_CLIENT_SECRET);
    case 'DECI_INVITE_EXPIRATION_SECONDS':
      return valueOrDefault(name, process.env.DECI_INVITE_EXPIRATION_SECONDS);
    case 'DECI_KEY_VALIDATION_EXPIRATION_SECONDS':
      return valueOrDefault(
        name,
        process.env.DECI_KEY_VALIDATION_EXPIRATION_SECONDS
      );
    case 'DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS':
      return valueOrDefault(
        name,
        process.env.DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS
      );
    case 'DECI_MAX_ATTACHMENT_SIZE':
      return valueOrDefault(name, process.env.DECI_MAX_ATTACHMENT_SIZE);
    case 'DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS':
      return valueOrDefault(
        name,
        process.env.DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS
      );
    case 'DECI_PORT':
      return valueOrDefault(name, process.env.DECI_PORT);
    case 'DECI_S3_ACCESS_KEY_ID':
      return valueOrDefault(name, process.env.DECI_S3_ACCESS_KEY_ID);
    case 'DECI_S3_ATTACHMENTS_BUCKET':
      return valueOrDefault(name, process.env.DECI_S3_ATTACHMENTS_BUCKET);
    case 'DECI_S3_ENDPOINT':
      return valueOrDefault(name, process.env.DECI_S3_ENDPOINT);
    case 'DECI_S3_PADS_BUCKET':
      return valueOrDefault(name, process.env.DECI_S3_PADS_BUCKET);
    case 'DECI_S3_PAD_BACKUPS_BUCKET':
      return valueOrDefault(name, process.env.DECI_S3_PAD_BACKUPS_BUCKET);
    case 'DECI_S3_THIRD_PARTIES_BUCKET':
      return valueOrDefault(name, process.env.DECI_S3_THIRD_PARTIES_BUCKET);
    case 'DECI_S3_SECRET_ACCESS_KEY':
      return valueOrDefault(name, process.env.DECI_S3_SECRET_ACCESS_KEY);
    case 'DECI_S3_EXTERNAL_DATA_SNAPSHOT_BUCKET':
      return valueOrDefault(
        name,
        process.env.DECI_S3_EXTERNAL_DATA_SNAPSHOT_BUCKET
      );
    case 'DECI_TEST_USER_SECRET':
      return valueOrDefault(name, process.env.DECI_TEST_USER_SECRET);
    case 'DISCORD_APP_ID':
      return valueOrDefault(name, process.env.DISCORD_APP_ID);
    case 'DISCORD_PUBLIC_KEY':
      return valueOrDefault(name, process.env.DISCORD_PUBLIC_KEY);
    case 'JWT_MAX_AGE':
      return valueOrDefault(name, process.env.JWT_MAX_AGE);
    case 'JWT_SECRET':
      return valueOrDefault(name, process.env.JWT_SECRET);
    case 'OPENAI_API_KEY':
      return valueOrDefault(name, process.env.OPENAI_API_KEY);
    case 'DEEPINFRA_API_KEY':
      return valueOrDefault(name, process.env.DEEPINFRA_API_KEY);
    case 'GOOGLE_VERTEX_API_KEY':
      return valueOrDefault(name, process.env.GOOGLE_VERTEX_API_KEY);
    case 'GIPHY_API_KEY':
      return valueOrDefault(name, process.env.GIPHY_API_KEY);
    case 'UNSPLASH_API_KEY':
      return valueOrDefault(name, process.env.UNSPLASH_API_KEY);
    case 'REPLICATE_API_KEY':
      return valueOrDefault(name, process.env.REPLICATE_API_KEY);
    case 'NEXTAUTH_URL':
      return valueOrDefault(name, process.env.NEXTAUTH_URL);
    case 'VITE_ANALYTICS_WRITE_KEY':
      return valueOrDefault(name, process.env.VITE_ANALYTICS_WRITE_KEY);
    case 'VITE_POSTHOG_API_KEY':
      return valueOrDefault(name, process.env.VITE_POSTHOG_API_KEY);
    case 'VITE_GOOGLE_ANALYTICS_ID':
      return valueOrDefault(name, process.env.VITE_GOOGLE_ANALYTICS_ID);
    case 'SENTRY_DSN':
      return valueOrDefault(name, process.env.SENTRY_DSN);
    case 'INTERCOM_SECRET_ID':
      return valueOrDefault(name, process.env.INTERCOM_SECRET_ID);
    case 'STRIPE_API_KEY':
      return valueOrDefault(name, process.env.STRIPE_API_KEY);
    case 'STRIPE_WEBHOOK_SECRET':
      return valueOrDefault(name, process.env.STRIPE_WEBHOOK_SECRET);
    case 'STRIPE_SECRET_KEY':
      return valueOrDefault(name, process.env.STRIPE_SECRET_KEY);
    case 'STRIPE_EXTRA_CREDITS_PRODUCT_ID':
      return valueOrDefault(name, process.env.STRIPE_EXTRA_CREDITS_PRODUCT_ID);
    case 'STRIPE_SUBSCRIPTIONS_PRODUCT_ID':
      return valueOrDefault(name, process.env.STRIPE_SUBSCRIPTIONS_PRODUCT_ID);
    case 'VITE_STRIPE_CUSTOMER_PORTAL_LINK':
      return valueOrDefault(name, process.env.VITE_STRIPE_CUSTOMER_PORTAL_LINK);
    case 'NOTION_CLIENT_ID':
      return valueOrDefault(name, process.env.NOTION_CLIENT_ID);
    case 'NOTION_CLIENT_SECRET':
      return valueOrDefault(name, process.env.NOTION_CLIENT_SECRET);
    case 'DISCORD_FEEDBACK_CHANNEL_TOKEN':
      return valueOrDefault(name, process.env.DISCORD_FEEDBACK_CHANNEL_TOKEN);
    case 'DISCORD_FEEDBACK_CHANNEL_ID':
      return valueOrDefault(name, process.env.DISCORD_FEEDBACK_CHANNEL_ID);
    case 'DECI_MAX_COLLAB_READERS_FREE_PLAN':
      return valueOrDefault(
        name,
        process.env.DECI_MAX_COLLAB_READERS_FREE_PLAN
      );
    case 'DECI_MAX_CREDITS_FREE':
      return valueOrDefault(name, process.env.DECI_MAX_CREDITS_FREE);
    case 'DECI_MAX_CREDITS_PRO':
      return valueOrDefault(name, process.env.DECI_MAX_CREDITS_PRO);
    case 'DECI_MAX_QUERIES_FREE':
      return valueOrDefault(name, process.env.DECI_MAX_QUERIES_FREE);
    case 'DECI_MAX_QUERIES_PRO':
      return valueOrDefault(name, process.env.DECI_MAX_QUERIES_PRO);
    case 'DECI_TOKENS_TO_CREDITS':
      return valueOrDefault(name, process.env.DECI_TOKENS_TO_CREDITS);
    case 'WORKSPACE_FREE_PLAN':
      return valueOrDefault(name, process.env.WORKSPACE_FREE_PLAN);
    case 'WORKSPACE_PRO_PLAN':
      return valueOrDefault(name, process.env.WORKSPACE_PRO_PLAN);
    case 'WORKSPACE_FREE_PLAN_NAME':
      return valueOrDefault(name, process.env.WORKSPACE_FREE_PLAN_NAME);
    case 'OPENAI_DECIPAD_GPT_BEARER_KEY':
      return valueOrDefault(name, process.env.OPENAI_DECIPAD_GPT_BEARER_KEY);
    case 'MAILERSEND_API_KEY':
      return valueOrDefault(name, process.env.MAILERSEND_API_KEY);

    case 'DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS':
      return valueOrDefault(
        name,
        process.env.DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS
      );

    case 'DATALAKE_WEBHOOK_SECRET':
      return valueOrDefault(name, process.env.DATALAKE_WEBHOOK_SECRET);
    case 'DATALAKE_AIRBYTE_CLIENT_ID':
      return valueOrDefault(name, process.env.DATALAKE_AIRBYTE_CLIENT_ID);
    case 'DATALAKE_AIRBYTE_CLIENT_SECRET':
      return valueOrDefault(name, process.env.DATALAKE_AIRBYTE_CLIENT_SECRET);
    case 'DATALAKE_AIRBYTE_URL':
      return valueOrDefault(name, process.env.DATALAKE_AIRBYTE_URL);
    case 'DATALAKE_AIRBYTE_WORKSPACE_ID':
      return valueOrDefault(name, process.env.DATALAKE_AIRBYTE_WORKSPACE_ID);
  }
}

function getEnvironment(base: string): 'localhost' | 'staging' | 'production' {
  if (base.includes('localhost')) {
    return 'localhost';
  }

  if (base.includes('decipadstaging.com') || base.includes('dev.decipad.com')) {
    return 'staging';
  }

  if (base.includes('app.decipad.com')) {
    return 'production';
  }

  throw new Error('Could always match the described URL bases');
}

export function app() {
  const urlBase = env('DECI_APP_URL_BASE');

  const environment = getEnvironment(urlBase);

  return {
    urlBase,
    apiPathBase: `/api`,
    environment,
    limits: {
      maxAttachmentSize: Number(env('DECI_MAX_ATTACHMENT_SIZE')),
      maxAttachmentUploadTokenExpirationSeconds: Number(
        env('DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS')
      ),
      maxAttachmentDownloadTokenExpirationSeconds: Number(
        env('DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS')
      ),
    },
  };
}

const isLocalDev = () => app().urlBase.includes('localhost');

const awsEndpoint = (_url: string) => {
  let urlString = _url;
  if (!urlString.startsWith('http')) {
    urlString = (isLocalDev() ? 'http://' : 'https://') + urlString;
  }
  return urlString;
};

export interface BucketsConfig {
  pads: string;
  attachments: string;
  padBackups: string;
  thirdParties: string;
  externalDataSnapshots: string;
}

export function s3(): S3ClientConfig & { buckets: BucketsConfig } {
  const credentials = {
    accessKeyId: env('DECI_S3_ACCESS_KEY_ID'),
    secretAccessKey: env('DECI_S3_SECRET_ACCESS_KEY'),
  };
  return {
    endpoint: awsEndpoint(env('DECI_S3_ENDPOINT')),
    ...(credentials.accessKeyId && credentials.secretAccessKey
      ? { credentials }
      : {}),
    region: env('AWS_REGION'),
    tls: !isLocalDev(),
    forcePathStyle: true,
    buckets: {
      pads: env('DECI_S3_PADS_BUCKET'),
      attachments: env('DECI_S3_ATTACHMENTS_BUCKET'),
      padBackups: env('DECI_S3_PAD_BACKUPS_BUCKET'),
      thirdParties: env('DECI_S3_THIRD_PARTIES_BUCKET'),
      externalDataSnapshots: env('DECI_S3_EXTERNAL_DATA_SNAPSHOT_BUCKET'),
    },
  };
}

export function monitor() {
  return {
    sentry: {
      dsn: env('SENTRY_DSN'),
    },
  };
}

export function analytics() {
  return {
    secretKey: env('VITE_ANALYTICS_WRITE_KEY'),
    posthogApiKey: env('VITE_POSTHOG_API_KEY'),
  };
}

export function auth() {
  return {
    userKeyValidationExpirationSeconds: Number(
      env('DECI_KEY_VALIDATION_EXPIRATION_SECONDS')
    ),
    inviteExpirationSeconds: Number(env('DECI_INVITE_EXPIRATION_SECONDS')),
    jwt: {
      secret: env('JWT_SECRET'),
      maxAge: Number(env('JWT_MAX_AGE')),
    },
    testUserSecret: env('DECI_TEST_USER_SECRET'),
  };
}

export function plans() {
  return {
    free: env('WORKSPACE_FREE_PLAN'),
    freePlanName: env('WORKSPACE_FREE_PLAN_NAME'),
    pro: env('WORKSPACE_PRO_PLAN'),
  };
}

export function limits() {
  //
  // Test values are used when creating test workspaces,
  // All other values should come from stripe.
  //

  const maxCredits = {
    free: Number(env('DECI_MAX_CREDITS_FREE')),
    pro: Number(env('DECI_MAX_CREDITS_PRO')),

    testPlus: 500,
    testBusiness: 2000,
  };

  const maxStorage = {
    free: 10,
    pro: 50,

    testPlus: 50,
    testBusiness: 200,
  };

  const maxCollabReaders = {
    free: Number(env('DECI_MAX_COLLAB_READERS_FREE_PLAN')),

    testPlus: 10,
    testBusiness: 999,
  };

  const maxCollabEditors = {
    free: 1,

    testPlus: 3,
    testBusiness: 5,
  };

  // please don't remove those as they are not the same as AI Credits
  const maxQueries = {
    free: Number(env('DECI_MAX_QUERIES_FREE')),
    pro: Number(env('DECI_MAX_QUERIES_PRO')),

    testPlus: 500,
    testBusiness: 2000,
  };

  const TOKENS_TO_CREDITS = Number(env('DECI_TOKENS_TO_CREDITS'));
  return {
    maxCollabReaders,
    maxCredits,
    maxQueries,
    maxCollabEditors,
    openAiTokensLimit: {
      free: maxCredits.free * TOKENS_TO_CREDITS,
      pro: maxCredits.pro * TOKENS_TO_CREDITS,

      testPlus: maxCredits.testPlus * TOKENS_TO_CREDITS,
      testBusiness: maxCredits.testBusiness * TOKENS_TO_CREDITS,
    },
    tokensToCredits: TOKENS_TO_CREDITS,
    storage: maxStorage,
  };
}

export interface EmailConfig {
  senderEmailAddress: string;
  apiKey: string;
}

export function email(): EmailConfig {
  return {
    senderEmailAddress: env('DECI_FROM_EMAIL_ADDRESS'),
    apiKey: env('MAILERSEND_API_KEY'),
  };
}

export function thirdParty() {
  return {
    intercom: {
      secretId: env('INTERCOM_SECRET_ID'),
    },
    google: {
      sheets: {
        apiKey: env('DECI_GOOGLESHEETS_API_KEY'),
        clientId: env('DECI_GOOGLESHEETS_CLIENT_ID'),
        clientSecret: env('DECI_GOOGLESHEETS_CLIENT_SECRET'),
      },
    },
    openai: {
      apiKey: env('OPENAI_API_KEY'),
      decipadGptBearerKey: env('OPENAI_DECIPAD_GPT_BEARER_KEY'),
    },
    giphy: {
      apiKey: env('GIPHY_API_KEY'),
    },
    replicate: {
      apiKey: env('REPLICATE_API_KEY'),
    },
    unsplash: {
      apiKey: env('UNSPLASH_API_KEY'),
    },
    stripe: {
      apiVersion: '2024-11-20.acacia' as const,
      webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
      secretKey: env('STRIPE_SECRET_KEY'), // 'sk_test_...
      apiKey: env('STRIPE_API_KEY'), // 'pk_test_...
      extraCreditsProdId: env('STRIPE_EXTRA_CREDITS_PRODUCT_ID'), // prod_...
      subscriptionsProdId: env('STRIPE_SUBSCRIPTIONS_PRODUCT_ID'),
    },
    defaultTokenExpirationSeconds: Number(
      env('DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS')
    ),
    notion: {
      clientId: env('NOTION_CLIENT_ID'),
      clientSecret: env('NOTION_CLIENT_SECRET'),
    },
    discord: {
      channelToken: env('DISCORD_FEEDBACK_CHANNEL_TOKEN'),
      channelId: env('DISCORD_FEEDBACK_CHANNEL_ID'),
    },
  };
}

export function discord() {
  return {
    publicKey: Buffer.from(env('DISCORD_PUBLIC_KEY'), 'hex'),
    appId: env('DISCORD_APP_ID'),
  };
}

const createGoogleServiceAccountCredentialsParser = once(() =>
  z.object({
    type: z.string(),
    project_id: z.string(),
    private_key_id: z.string(),
    private_key: z.string(),
    client_email: z.string(),
    client_id: z.string(),
    auth_uri: z.string(),
    token_uri: z.string(),
    auth_provider_x509_cert_url: z.string(),
    client_x509_cert_url: z.string(),
    universe_domain: z.string(),
  })
);

export const datalake = once(() => {
  const encodedCredentials = env('DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS');
  if (!encodedCredentials) {
    throw new Error(
      'To use data lake you need to have the DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS env var configured'
    );
  }
  try {
    const rootCredentials = createGoogleServiceAccountCredentialsParser().parse(
      JSON.parse(Buffer.from(encodedCredentials, 'base64').toString())
    );
    return {
      rootCredentials,
      webhookSecret: env('DATALAKE_WEBHOOK_SECRET'),
      airbyteClientId: env('DATALAKE_AIRBYTE_CLIENT_ID'),
      airbyteClientSecret: env('DATALAKE_AIRBYTE_CLIENT_SECRET'),
      airbyteUrl: env('DATALAKE_AIRBYTE_URL'),
      airbyteWorkspaceId: env('DATALAKE_AIRBYTE_WORKSPACE_ID'),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    throw new Error('Invalid DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS');
  }
});
