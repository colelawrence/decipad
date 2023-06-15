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

export const codePlaceholders = [
  `// Convert currency
const from = 'ILS';
const to = 'GBP';
const result = await fetch(\`https://api.exchangerate-api.com/v4/latest/\${from}\`);
const data = await result.json();
const fxRate = data.rates[to];
return fxRate;`,
  `// list 20 pokemons
const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
const data = await res.json();
return data.results`,
  `// a fact about your birthyear
const year = "1985"
return (await fetch(\`http://numbersapi.com/\${year}/year\`)).text();`,
  `// list all dogs that dont have regional breeds
const res = await fetch('https://dog.ceo/api/breeds/list/all');
const data = await res.json();
const message = data.message;
const dogsNoSubsbreeds = Object.keys(message).map((breed) => {
  return {
    name: breed,
    firstBreed: message[breed][0],
    hasBreeds: message[breed].length > 0
  }
}).filter((breed) => !breed.hasBreeds)
return dogsNoSubsbreeds;`,
  `// ten trivia questions
const res = await fetch('https://opentdb.com/api.php?amount=10');
const data = await res.json();
const results = data.results;
return results;`,
  `// Exchange rate for crypto
const res = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
const data = await res.json();
const rates = data.rates;
const allRates = Object.keys(rates).map((rateName) => {
  const current = rates[rateName];
  return {
    name: current.name,
    value: \`\${current.value}\`
  }
}).filter((rate) => rate.name !== 'Bitcoin')
return allRates;`,
  `// what country are you in
const result = await fetch('https://jsonip.com/');
const ipInfo = await result.json();
const country = ipInfo.country;
return country;`,
];

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
  }
}

const defaultPort = () => (process.env.NODE_ENV === 'production' ? 443 : 80);

const awsEndpoint = (_url: string) => {
  let url = _url;
  if (!url.startsWith('http')) {
    url =
      (process.env.NODE_ENV === 'production' ? 'https://' : 'http://') + url;
  }
  const parsed = new URL(url);
  const href = parsed.href.endsWith('/')
    ? parsed.href.slice(0, -1)
    : parsed.href;
  const port = Number(parsed.port);
  return {
    host: parsed.host,
    hostname: parsed.hostname,
    href,
    protocol: parsed.protocol,
    port: Number.isNaN(port) ? defaultPort() : port,
  };
};

export function s3() {
  return {
    endpoint: awsEndpoint(env('DECI_S3_ENDPOINT')),
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
    openai: {
      apiKey: env('OPENAI_API_KEY'),
    },
    stripe: {
      webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
      apiKey: env('STRIPE_API_KEY'),
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

export function codePlaceholder() {
  const easterEgg = `//
//
// experimental feature:
//   const availableDecipadNumbers = this;
//   const { Banana } = this;
//
//   you can then do a request, or base your logic
//   on your decipad notebook`;
  const maybeEaster = Math.random() > 0.8 ? `\n${easterEgg}` : '';
  const source =
    codePlaceholders[Math.floor(Math.random() * codePlaceholders.length)];
  return `${source}${maybeEaster}`;
}
