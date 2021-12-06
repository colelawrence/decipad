/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-done-callback */
/* eslint-env jest */
import waitForExpect from 'wait-for-expect';
import { Doc as YDoc, Text as YText, Map as YMap } from 'yjs';
import { Workspace, Pad } from '@decipad/backendtypes';
import { timeout } from '@decipad/utils';
import { WebsocketProvider, WSStatus } from '../../y-websocket/src';
import { testWithSandbox as test } from '../../backend-test-sandbox/src';

type TextNode = YMap<YText>;

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.log('uncaught exception', err);
});

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log('unhandled rejection', err);
});

test('connection', (ctx) => {
  const { test: it } = ctx;

  let workspace: Workspace;
  let pad: Pad;
  let doc: YDoc;
  let provider: WebsocketProvider | undefined;

  beforeAll(async () => {
    const authRes = await ctx.auth();
    const client = ctx.graphql.withAuth(authRes);
    workspace = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createWorkspace;

    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1" }
            ) {
              id
              name
              workspace {
                id
                name
              }
            }
          }
        `,
      })
    ).data.createPad;
  });

  afterAll(async () => {
    provider?.destroy();
    await timeout(1000);
  });

  it('can connect', async () => {
    const user = await ctx.auth();
    await new Promise<void>((resolve) => {
      doc = new YDoc();
      provider = new WebsocketProvider(ctx.websocketURL(pad.id), doc, {
        protocol: user.token,
      });
      provider.once('status', (status: WSStatus) => {
        expect(status).toMatchObject({
          status: 'connected',
        });
        resolve();
      });
    });
  });

  it('makes some changes', async () => {
    return new Promise((resolve) => {
      const children = doc.getArray<TextNode>();
      const textNode = new YMap<YText>();
      children.push([textNode]);
      textNode.set('text', new YText('hey'));
      expect(textNode.get('text')?.toString()).toBe('hey');
      provider?.once('synced', resolve);
    });
  });

  it('can disconnect', () => {
    return new Promise<void>((resolve) => {
      provider?.once('status', (status: WSStatus) => {
        expect(status).toMatchObject({
          status: 'disconnected',
        });
        resolve();
      });

      provider?.destroy();
      provider = undefined;
    });
  });

  it('can connect back', async () => {
    const user = await ctx.auth();
    await new Promise<void>((resolve) => {
      doc = new YDoc();
      provider = new WebsocketProvider(ctx.websocketURL(pad.id), doc, {
        protocol: user.token,
        connectBc: false,
      });
      provider.once('status', (status: WSStatus) => {
        expect(status).toMatchObject({
          status: 'connected',
        });
        resolve();
      });
    });
  });

  it('gets the previous state', async () => {
    await waitForExpect(() => {
      const children = doc.getArray<TextNode>();
      expect(children).toHaveLength(1);
      const textNode = children.get(0);
      expect(textNode).toBeDefined();
      const text = textNode.get('text');
      expect(text).toBeDefined();
      expect(text?.toString()).toBe('hey');
    });
  });
});
