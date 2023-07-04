import { Writable } from 'node:stream';

export const bufferStream = (): [Writable, Promise<string>] => {
  let b = '';
  let resolve: (w: string) => void;
  let reject: (e: Error) => void;
  const p = new Promise<string>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  const s = new Writable({
    decodeStrings: true,
    defaultEncoding: 'utf-8',
    write(chunk, _, cb) {
      if (Buffer.isBuffer(chunk)) {
        b += chunk.toString('utf-8');
      } else {
        b += chunk;
      }
      cb();
    },
  });

  s.once('error', (err) => {
    reject(err);
  });

  s.once('finish', () => {
    resolve(b);
  });

  return [s, p];
};
