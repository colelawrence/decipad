import { Subject } from 'rxjs';
import type { MessageSender } from '.';

export const version1 = (): MessageSender => {
  const message = new Subject<string>();
  const send = (m: Uint8Array) => {
    message.next(JSON.stringify(Buffer.from(m).toString('base64')));
  };
  return {
    message,
    send,
  };
};
