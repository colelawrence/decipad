import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseDotEnv } from 'dotenv';
import { Config } from './config';
import baseUrl from './base-url';
import getPorts from './get-ports';

export type Env = Record<string, string | undefined>;
type ISandboxEnvReturn = [Env, Config];

export async function createSandboxEnv(
  workerId: number
): Promise<ISandboxEnvReturn> {
  // read the testing env config file
  // from '../.testing.env'
  const baseConfig = parseDotEnv(
    readFileSync(join(__dirname, '..', '.testing.env'))
  );

  // we have to inject some of these variables into the worker
  // process so that some libraries that run on the tests work.
  Object.assign(process.env, baseConfig);

  const envBaseConfig = {
    PATH: process.env.PATH,
    PWD: process.env.PWD,
    LANG: process.env.LANG,
    HOME: process.env.HOME,
    JEST_WORKER_ID: process.env.JEST_WORKER_ID,
    NODE_ENV: 'testing',
  };

  // configure Architect's ports
  const [portBase, eventsPort, tablesPort, s3Port, arcPort] = await getPorts(
    workerId,
    5
  );
  const appConfig = {
    PORT: portBase,
    NEXTAUTH_URL: new URL('api/auth', baseUrl(portBase)).href,
    ARC_EVENTS_PORT: eventsPort,
    ARC_TABLES_PORT: tablesPort,
    ARC_INTERNAL: arcPort,
    DECI_S3_ENDPOINT: `localhost:${s3Port}`,
  };

  // the final sandbox environment:
  const env = {
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
