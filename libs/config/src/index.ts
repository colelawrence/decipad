import { fail } from 'assert';

export function s3() {
  return {
    endpoint: env('DECI_S3_ENDPOINT', 'localhost:4568'),
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
      dsn: env('SENTRY_DSN', ''),
    },
  };
}

export function app() {
  return {
    urlBase: env('DECI_APP_URL_BASE', 'http://localhost:4200'),
    limits: {
      maxAttachmentSize: Number(env('DECI_MAX_ATTACHMENT_SIZE', '10485760')),
      maxAttachmentUploadTokenExpirationSeconds: Number(
        env('DECI_MAX_ATTACHMENT_UPLOAD_TOKEN_EXPIRATION_SECONDS', '600')
      ),
      maxAttachmentDownloadTokenExpirationSeconds: Number(
        env('DECI_MAX_ATTACHMENT_DOWNLOAD_TOKEN_EXPIRATION_SECONDS', '600')
      ),
    },
  };
}

export function auth() {
  return {
    userKeyValidationExpirationSeconds: Number(
      env('DECI_KEY_VALIDATION_EXPIRATION_SECONDS', '2592000')
    ),
    inviteExpirationSeconds: Number(
      env('DECI_INVITE_EXPIRATION_SECONDS', '86400')
    ),
    jwt: {
      secret: env('JWT_SECRET'),
      signingKey: Buffer.from(
        env('JWT_SIGNING_PRIVATE_KEY'),
        'base64'
      ).toString(),
      maxAge: Number(env('JWT_MAX_AGE', '2592000')),
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
      region: env('AWS_REGION', 'eu-west-2'),
    },
    senderEmailAddress: env('DECI_FROM_EMAIL_ADDRESS'),
  };
}

function env(
  name: string,
  defaultValue: string | undefined = undefined
): string {
  let value = process.env[name];
  if (value == null) {
    if (defaultValue !== undefined) {
      value = defaultValue;
    } else {
      fail(`${name} env var must be defined`);
    }
  }
  return value;
}
