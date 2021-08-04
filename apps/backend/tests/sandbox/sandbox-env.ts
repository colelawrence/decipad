import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseDotEnv } from 'dotenv';
import { Config } from './config';
import baseUrl from './base-url';

export type Env = Record<string, string>;
type ISandboxEnvReturn = [Env, Config];

export function createSandboxEnv(workerId: number): ISandboxEnvReturn {
  // read the testing env config file
  // from '../.testing.env'
  const baseConfig = parseDotEnv(
    readFileSync(join(__dirname, '..', '.testing.env'))
  );

  // we have to inject some of these variables into the worker
  // process so that some libraries that run on the tests work.
  Object.assign(process.env, baseConfig);

  const envBaseConfig = {
    PATH: process.env.PATH!,
    PWD: process.env.PWD!,
    LANG: process.env.LANG!,
    HOME: process.env.HOME!,
    JEST_WORKER_ID: process.env.JEST_WORKER_ID!,
    NODE_ENV: 'testing',
  };

  // configure Architect's ports
  const portBase = '' + (3333 + workerId * 100 - Math.ceil(Math.random() * 50));
  const eventsPort = portBase + '1'; // string concat, just like Architect does
  const tablesPort = portBase + '2'; // string concat, just like Architect does
  const s3Port = portBase + '3';
  const appConfig = {
    PORT: portBase,
    NEXTAUTH_URL: new URL('api/auth', baseUrl(portBase)).href,
    ARC_EVENTS_PORT: eventsPort,
    ARC_TABLES_PORT: tablesPort,
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
