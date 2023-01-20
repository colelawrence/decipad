import { Receiver } from '@decipad/message-packer';
import type { MessageHandler } from '.';

export const version2 = (): MessageHandler => {
  const r = new Receiver();
  return {
    message: r.messages,
    receive: r.receive.bind(r),
  };
};
