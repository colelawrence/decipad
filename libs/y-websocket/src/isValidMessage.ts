import { Buffer } from 'buffer';

export const isValidMessage = (m: Uint8Array | string): boolean => {
  const s = m instanceof Uint8Array ? Buffer.from(m).toString('base64') : m;
  try {
    const json = JSON.parse(s);
    return !('message' in json) || json.message !== 'Internal server error';
  } catch (err) {
    // not JSON, so we're good
    return true;
  }
};
