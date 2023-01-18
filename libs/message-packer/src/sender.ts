import { nanoid } from 'nanoid';
import { Subject } from 'rxjs';
import {
  Encoder,
  writeVarString,
  writeUint16,
  writeUint8Array,
  toUint8Array,
} from 'lib0/encoding';

const OVERHEAD_BYTES = 28; //

const slicer = (maxLength: number) => {
  const max = maxLength - OVERHEAD_BYTES;
  if (max < 1) {
    throw new Error(`max length of message is not achievable: ${maxLength}`);
  }
  const slice = (message: Uint8Array): Uint8Array[] => {
    if (message.byteLength > max) {
      const first = message.slice(0, max);
      const rest = slice(message.slice(max));
      return [first, ...rest];
    }
    return [message];
  };
  return slice;
};

const encoder =
  (messageId: string) =>
  (message: Uint8Array, messageCount: number, pos: number): Uint8Array => {
    const enc = new Encoder();
    writeVarString(enc, messageId);
    writeUint16(enc, messageCount);
    writeUint16(enc, pos);
    writeUint16(enc, message.length);
    writeUint8Array(enc, message);
    return toUint8Array(enc);
  };

export class Sender {
  public readonly messages = new Subject<Buffer>();
  private readonly slice: (message: Uint8Array) => Uint8Array[];

  constructor(maxMessageSize: number) {
    this.slice = slicer(maxMessageSize);
  }

  public send(message: Uint8Array) {
    const encode = encoder(nanoid());
    const slices = this.slice(message);
    for (const slice of slices.map((m, pos) => encode(m, slices.length, pos))) {
      this.messages.next(Buffer.from(slice));
    }
  }
}
