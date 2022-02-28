import handle from '../handle';
import { version } from '../../../../../package.json';

export const handler = handle(async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ version, hash: process.env.GIT_COMMIT_HASH }),
    headers: { 'content-type': 'application/json' },
  };
});
