import { shuffle } from 'lodash';
import { nanoid } from 'nanoid';
import { Receiver, Sender } from '.';

const randomMessage = (length: number) => (): Buffer => {
  const buf = Buffer.allocUnsafe(length);
  buf.fill(nanoid()[0]);
  return buf;
};

describe('message packer', () => {
  it('cannot be instantiated with max message size below overhead', () => {
    expect(() => new Sender(28)).toThrow();
  });
  it('sends randomly and receives in order', () => {
    const messages = Array.from({ length: 100 }).map(randomMessage(3_156));
    const sender = new Sender(40);
    const packets: Array<Buffer> = [];
    const senderSub = sender.messages.subscribe((m) => {
      expect(m.length).toBeLessThanOrEqual(40);
      packets.push(m);
    });
    for (const m of messages) {
      sender.send(m);
    }
    senderSub.unsubscribe();

    const receiver = new Receiver();
    const shuffledPackets = shuffle(packets);

    const receivedMessages: Array<Uint8Array> = [];
    const receiverSub = receiver.messages.subscribe((message) => {
      receivedMessages.push(message);
    });
    for (const packet of shuffledPackets) {
      receiver.receive(packet);
    }
    receiverSub.unsubscribe();

    expect(receivedMessages.length).toBe(100);
    expect(receivedMessages.sort()).toMatchObject(messages.sort());
    expect(receiver.pending).toBe(0);
  });
});
