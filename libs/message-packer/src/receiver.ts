import { Subject } from 'rxjs';
import {
  Decoder,
  readVarString,
  readUint16,
  readUint8Array,
} from 'lib0/decoding';
import { getDefined } from '@decipad/utils';

class MessagePrep {
  public readonly pendingMessages: Array<Uint8Array>;
  public readonly expectedMessageCount: number;

  constructor(expectedMessageCount: number) {
    this.pendingMessages = new Array(expectedMessageCount);
    this.expectedMessageCount = expectedMessageCount;
  }
}

export class Receiver {
  public readonly messages = new Subject<Buffer>();
  private pendingMessages = new Map<string, MessagePrep>();

  private maybeFinalizeMessage(messageId: string) {
    const messages = getDefined(this.pendingMessages.get(messageId));

    if (
      messages.pendingMessages.filter((m) => m != null).length ===
      messages.expectedMessageCount
    ) {
      this.release(messageId);
    }
  }

  private release(messageId: string) {
    const messages = getDefined(this.pendingMessages.get(messageId));
    this.messages.next(Buffer.concat(messages.pendingMessages));
    this.pendingMessages.delete(messageId);
  }

  public receive(message: Uint8Array) {
    const decoder = new Decoder(message);
    const messageId = readVarString(decoder);
    const messageCount = readUint16(decoder);
    let prep = this.pendingMessages.get(messageId);
    if (!prep) {
      prep = new MessagePrep(messageCount);
      this.pendingMessages.set(messageId, prep);
    }
    const pos = readUint16(decoder);
    const len = readUint16(decoder);
    prep.pendingMessages[pos] = readUint8Array(decoder, len);

    this.maybeFinalizeMessage(messageId);
  }

  public get pending() {
    return this.pendingMessages.size;
  }
}
