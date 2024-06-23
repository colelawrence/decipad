/* eslint-disable import/no-extraneous-dependencies */
import { join } from 'path';
import WebSocket from 'ws';
import { rimrafSync } from 'rimraf';
import 'isomorphic-fetch';

process.env.DECI_ENV_CONFIG_FILE_PATH = join(
  __dirname,
  '..',
  '..',
  'apps',
  'backend-tests',
  '.testing.env'
);

process.env.DECI_SANDBOX_LOCK_FILE_PATH = join(
  __dirname,
  '..',
  '..',
  'apps',
  'backend',
  'app.arc'
);

global.WebSocket = WebSocket as unknown as typeof global.WebSocket;

rimrafSync(join(__dirname, '.kafka_lite_data'));
rimrafSync(join(__dirname, '.s3rver_data'));
