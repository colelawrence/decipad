import { Doc } from 'yjs';
import { createTestProvider } from './testUtils';
import { readMessage } from './y-websocket';
import messages from './__fixtures__/message_sample_001.json';

describe('websocket protocol', () => {
  it('does not break', () => {
    const doc = new Doc();
    const provider = createTestProvider(doc);
    expect(() => {
      for (const message of messages) {
        readMessage(provider, Buffer.from(message, 'base64'), false);
      }
    }).not.toThrow();
  });
});
