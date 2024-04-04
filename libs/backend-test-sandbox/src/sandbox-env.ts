import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { config as configDotEnv, parse as parseDotEnv } from 'dotenv';
import { readFileSync } from 'fs';
import stringify from 'json-stringify-safe';
import { nanoid } from 'nanoid';
import baseUrl from './base-url';
import type { Config } from './config';
import getPorts from './get-ports';

configDotEnv();

export type Env = NodeJS.ProcessEnv & Record<string, string | undefined>;
type ISandboxEnvReturn = [Env, Config];

const getAwsCredentialsFromIni = async () => {
  try {
    const credentials = await fromIni({ profile: 'default' })();
    return {
      AWS_ACCESS_KEY_ID: credentials.accessKeyId,
      AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    };
  } catch (err) {
    if (!process.env.CI) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
  return undefined;
};

const getAwsCredentialsFromEnv = async () => {
  try {
    const credentials = await fromEnv()();
    return {
      AWS_ACCESS_KEY_ID: credentials.accessKeyId,
      AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    };
  } catch (err) {
    if (!process.env.CI) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
  return undefined;
};

const getAwsCredentials = async () =>
  (await getAwsCredentialsFromIni()) ?? getAwsCredentialsFromEnv();

export async function createSandboxEnv(
  workerId: number
): Promise<ISandboxEnvReturn> {
  // read the testing env config file
  const envConfigFilePath =
    process.env.DECI_ENV_CONFIG_FILE_PATH || '.testing.env';
  const baseConfig = parseDotEnv(readFileSync(envConfigFilePath));

  const credentials = await getAwsCredentials();

  const envBaseConfig = {
    PATH: process.env.PATH,
    PWD: process.env.PWD,
    LANG: process.env.LANG,
    HOME: process.env.HOME,
    JEST_WORKER_ID: process.env.JEST_WORKER_ID,
    // Architect uses env name testing instead of the conventional test
    NODE_ENV: 'testing' as 'test',
    DEBUG: process.env.DEBUG,
    CI: process.env.CI,
  };

  // configure Architect's ports
  const newPorts = await getPorts(workerId, 6);
  const [portBase, eventsPort, tablesPort, s3Port, arcPort] = newPorts;
  const searchPort = process.env.SEARCH_PORT ?? newPorts[5];

  const ports: Record<string, string> = {
    _arc: arcPort,
    http: portBase,
    tables: tablesPort,
    events: eventsPort,
    s3: s3Port,
  };
  const ARC_SANDBOX = {
    version: '5.0.0', // arc needs this
    ports,
  };

  const appConfig: Record<string, string | undefined> = {
    PORT: portBase,
    ARC_WSS_URL: `ws://localhost:${portBase}/`,
    NEXTAUTH_URL: new URL('api/auth', baseUrl(portBase)).href,
    ARC_HTTP_PORT: portBase,
    ARC_EVENTS_PORT: eventsPort,
    ARC_TABLES_PORT: tablesPort,
    ARC_INTERNAL: arcPort,
    ARC_INTERNAL_PORT: arcPort,
    ARC_SANDBOX: stringify(ARC_SANDBOX),
    DECI_S3_ENDPOINT: `localhost:${s3Port}`,
    DECI_SEARCH_PORT: searchPort,
    DECI_APP_URL_BASE: `http://localhost:${portBase}`,
    OVERRIDE_DECI_APP_URL_BASE: `http://localhost:${portBase}`,
    VITE_DECI_WS_URL: `ws://localhost:${portBase}/ws`,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
    JWT_SECRET: process.env.JWT_SECRET || nanoid(),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GIPHY_API_KEY: process.env.GIPHY_API_KEY,
    UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY,
    REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_EXTRA_CREDITS_PRODUCT_ID:
      process.env.STRIPE_EXTRA_CREDITS_PRODUCT_ID,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DECI_BACKEND_TEST: 'true',
    DECI_SEARCH_URL: process.env.DECI_SEARCH_URL,
    DECI_SEARCH_USERNAME: process.env.DECI_SEARCH_USERNAME,
    DECI_SEARCH_PASSWORD: process.env.DECI_SEARCH_PASSWORD,
    WORKSPACE_FREE_PLAN: process.env.WORKSPACE_FREE_PLAN,
    WORKSPACE_PRO_PLAN: process.env.WORKSPACE_PRO_PLAN,
  };

  // the final sandbox environment:
  const env = {
    ...baseConfig,
    ...credentials,
    ...envBaseConfig,
    ...appConfig,
  };

  // this is the only configuration that the tests should need to know:
  const remoteConfig = {
    apiPort: Number(portBase),
    tablesPort: Number(tablesPort),
  };

  // set some local environment variables
  // that some libraries need.
  Object.assign(process.env, appConfig);

  return [env, remoteConfig];
}
