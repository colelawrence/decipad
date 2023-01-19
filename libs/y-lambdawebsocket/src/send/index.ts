import { Observable } from 'rxjs';
import { version1 } from './version1';
import { version2 } from './version2';

export interface MessageSender {
  message: Observable<string>;
  send: (message: Uint8Array) => void;
}

const protocolHandlers: Record<number, () => MessageSender> = {
  1: version1,
  2: version2,
};

export const sender = (protocolVersion: number): MessageSender => {
  const handlerBuilder = protocolHandlers[protocolVersion];
  if (!handlerBuilder) {
    throw new Error(`Invalid protocol version: ${protocolVersion}`);
  }
  return handlerBuilder();
};
