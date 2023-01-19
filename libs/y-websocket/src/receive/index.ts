import { Subject } from 'rxjs';
import { version1 } from './version1';
import { version2 } from './version2';

export interface MessageHandler {
  message: Subject<Buffer>;
  receive: (message: Uint8Array) => void;
}

const protocolHandlers: Record<number, () => MessageHandler> = {
  1: version1,
  2: version2,
};

export const receiver = (protocolVersion: number): MessageHandler => {
  const handlerBuilder = protocolHandlers[protocolVersion];
  if (!handlerBuilder) {
    throw new Error(`Invalid protocol version: ${protocolVersion}`);
  }
  return handlerBuilder();
};
