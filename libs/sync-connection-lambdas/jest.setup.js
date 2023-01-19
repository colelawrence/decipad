require('isomorphic-fetch');
const { join } = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const WebSocket = require('ws');

global.WebSocket = WebSocket;

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
