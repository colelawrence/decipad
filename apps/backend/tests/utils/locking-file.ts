import { lock as lockFile } from 'proper-lockfile';
import { timeout } from './timeout';

const retryLockMs = 1000;

export default function lockingFile(path: string) {
  return async (promise: Promise<void>): Promise<void> => {
    const release = await lock(path);
    try {
      await promise;
    } finally {
      await release();
    }
  };
}

async function lock(path: string) {
  let release;
  while (!release) {
    try {
      release = await lockFile(path);
      break;
    } catch (err) {
      if (err.message.indexOf('already being held') >= 0) {
        await timeout(retryLockMs);
      } else {
        throw err;
      }
    }
  }

  return release;
}
