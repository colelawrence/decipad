import { lock as lockFile } from 'proper-lockfile';
import { timeout } from '../utils/timeout';

const retryLockMs = 1000;

export default function lockingFile(path: string) {
  return async (fn: () => Promise<void>): Promise<void> => {
    const release = await lock(path);
    try {
      await fn();
    } finally {
      await release();
    }
  };
}

async function lock(path: string) {
  let release;
  /* eslint-disable no-await-in-loop */
  while (!release) {
    try {
      release = await lockFile(path);
      break;
    } catch (err) {
      if (
        err.message.indexOf('already being held') >= 0 ||
        err.code === 'ENOENT'
      ) {
        await timeout(retryLockMs);
      } else {
        throw err;
      }
    }
  }
  /* eslint-enable no-await-in-loop */

  return release;
}
