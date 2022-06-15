import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseDotEnv } from 'dotenv';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import { Config } from './config';
import baseUrl from './base-url';
import getPorts from './get-ports';

export type Env = NodeJS.ProcessEnv & Record<string, string | undefined>;
type ISandboxEnvReturn = [Env, Config];

async function loadAWSConfig(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    AWS.config.getCredentials((err, credentials) => {
      if (err) {
        reject(err);
      } else {
        if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
          return reject(new Error('Could not load AWS credentials'));
        }
        resolve({
          AWS_ACCESS_KEY_ID: credentials?.accessKeyId,
          AWS_SECRET_ACCESS_KEY: credentials?.secretAccessKey,
        });
      }
    });
  });
}

export async function createSandboxEnv(
  workerId: number
): Promise<ISandboxEnvReturn> {
  // read the testing env config file
  const envConfigFilePath =
    process.env.DECI_ENV_CONFIG_FILE_PATH || join('tests', '.testing.env');
  const awsConfig = await loadAWSConfig();
  const baseConfig = parseDotEnv(readFileSync(envConfigFilePath));

  // we have to inject some of these variables into the worker
  // process so that some libraries that run on the tests work.
  Object.assign(process.env, baseConfig);

  const envBaseConfig = {
    PATH: process.env.PATH,
    PWD: process.env.PWD,
    LANG: process.env.LANG,
    HOME: process.env.HOME,
    JEST_WORKER_ID: process.env.JEST_WORKER_ID,
    // Architect uses env name testing instead of the conventional test
    NODE_ENV: 'testing' as 'test',
  };

  // configure Architect's ports
  const [portBase, eventsPort, tablesPort, s3Port, arcPort] = await getPorts(
    workerId,
    5
  );

  const ports: Record<string, string> = {
    _arc: arcPort,
    http: portBase,
    tables: tablesPort,
    events: eventsPort,
    s3: s3Port,
  };
  const ARC_SANDBOX = {
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
    ARC_SANDBOX: JSON.stringify(ARC_SANDBOX),
    DECI_S3_ENDPOINT: `localhost:${s3Port}`,
    DECI_APP_URL_BASE: `http://localhost:${portBase}`,
    REACT_APP_DECI_WS_URL: `ws://localhost:${portBase}/ws`,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
    JWT_SECRET: process.env.JWT_SECRET || nanoid(),
  };

  // the final sandbox environment:
  const env = {
    ...awsConfig,
    ...baseConfig,
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
