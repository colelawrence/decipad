import { Buffer } from 'buffer';
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
    case 'NEXTAUTH_URL':
      return valueOrDefault(name, process.env.NEXTAUTH_URL);
    case 'SENTRY_DSN':
      return valueOrDefault(name, process.env.SENTRY_DSN);
  }
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function s3() {
  return {
    endpoint: env('DECI_S3_ENDPOINT'),
    accessKeyId: env('DECI_S3_ACCESS_KEY_ID'),
    secretAccessKey: env('DECI_S3_SECRET_ACCESS_KEY'),
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

export function app() {
  return {
    urlBase: env('DECI_APP_URL_BASE'),
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

export function email() {
  return {
    ses: {
      accessKeyId: env('DECI_SES_ACCESS_KEY_ID'),
      secretAccessKey: env('DECI_SES_SECRET_ACCESS_KEY'),
      region: env('AWS_REGION'),
    },
    senderEmailAddress: env('DECI_FROM_EMAIL_ADDRESS'),
  };
}

export function thirdParty() {
  return {
    google: {
      sheets: {
        apiKey: env('DECI_GOOGLESHEETS_API_KEY'),
        clientId: env('DECI_GOOGLESHEETS_CLIENT_ID'),
        clientSecret: env('DECI_GOOGLESHEETS_CLIENT_SECRET'),
      },
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
