/* eslint-disable import/no-extraneous-dependencies */
const { join } = require('path');
const WebSocket = require('ws');
require('jest-fetch-mock').enableMocks();

process.env.DECI_ENV_CONFIG_FILE_PATH = join(
  __dirname,
  '..',
  '..',
  'apps',
  'backend',
  'tests',
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

global.WebSocket = WebSocket;
