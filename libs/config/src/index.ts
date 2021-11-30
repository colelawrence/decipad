import { Buffer } from 'buffer';
import { fail } from 'assert';
import { defaultEnv, SupportedEnvKey } from './default';

function env(name: SupportedEnvKey): string {
  let value = process.env[name];
  if (value == null) {
    const defaultValue = defaultEnv(name);
    if (defaultValue !== undefined) {
      value = defaultValue;
    } else {
      fail(`${name} env var must be defined`);
    }
  }
  return value;
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
      signingKey: Buffer.from(
        env('JWT_SIGNING_PRIVATE_KEY'),
        'base64'
      ).toString(),
      maxAge: Number(env('JWT_MAX_AGE')),
    },
    providers: {
      github: {
        clientId: env('GITHUB_CLIENT_ID'),
        clientSecret: env('GITHUB_CLIENT_SECRET'),
      },
    },
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
