import { Subject } from 'rxjs';
import type { MessageHandler } from '.';

export const version1 = (): MessageHandler => {
  const message = new Subject<Buffer>();
  const receive = (m: Uint8Array) => {
    message.next(Buffer.from(m));
  };
  return {
    message,
    receive,
  };
};
