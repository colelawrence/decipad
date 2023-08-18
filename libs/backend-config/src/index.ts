import { Buffer } from 'buffer';
import { S3ClientConfig } from '@aws-sdk/client-s3';
import { SESClientConfig } from '@aws-sdk/client-ses';
import { defaultEnv, SupportedEnvKey } from './default';

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
    case 'DECI_S3_SECRET_ACCESS_KEY':
      return valueOrDefault(name, process.env.DECI_S3_SECRET_ACCESS_KEY);
    case 'DECI_SES_ACCESS_KEY_ID':
      return valueOrDefault(name, process.env.DECI_SES_ACCESS_KEY_ID);
    case 'DECI_SES_SECRET_ACCESS_KEY':
      return valueOrDefault(name, process.env.DECI_SES_SECRET_ACCESS_KEY);
    case 'DECI_TEST_USER_SECRET':
      return valueOrDefault(name, process.env.DECI_TEST_USER_SECRET);
    case 'DISCORD_APP_ID':
      return valueOrDefault(name, process.env.DISCORD_APP_ID);
    case 'DISCORD_PUBLIC_KEY':
      return valueOrDefault(name, process.env.DISCORD_PUBLIC_KEY);
    case 'GITHUB_CLIENT_ID':
      return valueOrDefault(name, process.env.GITHUB_CLIENT_ID);
    case 'GITHUB_CLIENT_SECRET':
      return valueOrDefault(name, process.env.GITHUB_CLIENT_SECRET);
    case 'JWT_MAX_AGE':
      return valueOrDefault(name, process.env.JWT_MAX_AGE);
    case 'JWT_SECRET':
      return valueOrDefault(name, process.env.JWT_SECRET);
    case 'OPENAI_API_KEY':
      return valueOrDefault(name, process.env.OPENAI_API_KEY);
    case 'NEXTAUTH_URL':
      return valueOrDefault(name, process.env.NEXTAUTH_URL);
    case 'REACT_APP_ANALYTICS_WRITE_KEY':
      return valueOrDefault(name, process.env.REACT_APP_ANALYTICS_WRITE_KEY);
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
    case 'REACT_APP_STRIPE_PAYMENT_LINK':
      return valueOrDefault(name, process.env.REACT_APP_STRIPE_PAYMENT_LINK);
    case 'REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK':
      return valueOrDefault(
        name,
        process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK
      );
  }
}

export function app() {
  const urlBase = env('DECI_APP_URL_BASE');
  return {
    urlBase,
    apiPathBase: `/api`,
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
    secretKey: env('REACT_APP_ANALYTICS_WRITE_KEY'),
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

export interface EmailConfig {
  senderEmailAddress: string;
  ses: SESClientConfig;
}

export function email(): EmailConfig {
  const credentials = {
    accessKeyId: env('DECI_SES_ACCESS_KEY_ID'),
    secretAccessKey: env('DECI_SES_SECRET_ACCESS_KEY'),
  };
  return {
    ses: {
      ...(credentials.accessKeyId && credentials.secretAccessKey
        ? { credentials }
        : {}),
      region: env('AWS_REGION'),
    },
    senderEmailAddress: env('DECI_FROM_EMAIL_ADDRESS'),
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
    },
    stripe: {
      webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
      secretKey: env('STRIPE_SECRET_KEY'), // 'sk_test_...
      apiKey: env('STRIPE_API_KEY'), // 'pk_test_...
    },
    defaultTokenExpirationSeconds: Number(
      env('DECI_DEFAULT_TOKEN_EXPIRATION_SECONDS')
    ),
  };
}

export function discord() {
  return {
    publicKey: Buffer.from(env('DISCORD_PUBLIC_KEY'), 'hex'),
    appId: env('DISCORD_APP_ID'),
  };
}
