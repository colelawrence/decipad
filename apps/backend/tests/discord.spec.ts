import { Buffer } from 'buffer';
import { nanoid } from 'nanoid';
import nacl from 'tweetnacl';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

function interaction() {
  return {
    id: nanoid(),
    application_id: 'discord app id',
    type: 1, // ping
    version: 1,
  };
}

const signKeyPair = nacl.sign.keyPair();
process.env.DISCORD_PUBLIC_KEY = Buffer.from(signKeyPair.publicKey).toString(
  'hex'
);

function headersFor(message: string): Record<string, string> {
  const timestamp = `${Date.now()}`;
  const signature = nacl.sign.detached(
    Buffer.from(timestamp + message),
    signKeyPair.secretKey
  );
  return {
    'X-Signature-Ed25519': Buffer.from(signature).toString('hex'),
    'X-Signature-Timestamp': timestamp,
  };
}

test('discord', (ctx) => {
  it('discards request without sec headers', async () => {
    const response = await ctx.http.fetch('/api/discord', {
      method: 'POST',
      body: JSON.stringify(interaction()),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('allows a ping', async () => {
    const requestBody = JSON.stringify(interaction());
    const response = await ctx.http.fetch('/api/discord', {
      method: 'POST',
      body: requestBody,
      headers: headersFor(requestBody),
    });

    expect(response.ok).toBe(true);
    expect(await response.json()).toMatchObject({ type: 1 });
  });
});
