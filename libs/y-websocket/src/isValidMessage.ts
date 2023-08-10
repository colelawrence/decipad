import { Buffer } from 'buffer';

export const isValidMessage = (m: Uint8Array | string): boolean => {
  const s = m instanceof Uint8Array ? Buffer.from(m).toString('base64') : m;
  if (s.length > 10_000) {
    // we don't even want to parse this
    return true;
  }
  try {
    // if this is a JSON message with an error prop it means there was a server-side problem
    // let's ignore it
    const json = JSON.parse(s);
    return !('message' in json);
  } catch (err) {
    // not JSON, so we're good
    return true;
  }
};
