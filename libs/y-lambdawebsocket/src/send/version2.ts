import { Sender } from '@decipad/message-packer';
import { map } from 'rxjs';
import type { MessageSender } from '.';
import { MAX_MESSAGE_BYTES } from '../y-lambdawebsocket';

export const version2 = (): MessageSender => {
  const r = new Sender(MAX_MESSAGE_BYTES);
  return {
    message: r.messages.pipe(map((m) => m.toString('base64'))),
    send: r.send.bind(r),
  };
};
