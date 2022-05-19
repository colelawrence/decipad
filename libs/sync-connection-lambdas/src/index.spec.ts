/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-done-callback */
/* eslint-env jest */
import { Pad, Workspace } from '@decipad/backendtypes';
import { timeout } from '@decipad/utils';
import waitForExpect from 'wait-for-expect';
import { Doc as YDoc, Map as YMap, Text as YText } from 'yjs';
import { testWithSandbox as test } from '../../backend-test-sandbox/src';
import {
  createWebsocketProvider,
  TWebSocketProvider,
  WSStatus,
} from '../../y-websocket/src';

type TextNode = YMap<YText>;
type Status = 'connecting' | 'connected' | 'disconnected';

test('connection', (ctx) => {
  const { test: it } = ctx;

  let workspace: Workspace;
  let pad: Pad;
  let doc: YDoc;
  let provider: TWebSocketProvider | undefined;

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
      provider = createWebsocketProvider(doc, {
        protocol: user.token,
        beforeConnect: (p) => {
          // eslint-disable-next-line no-param-reassign
          p.serverUrl = `${ctx.websocketURL()}?doc=${pad.id}`;
        },
      });

      provider.once('status', (status1: WSStatus) => {
        expect(status1).toMatchObject({
          status: 'connecting',
        });
        provider!.once('status', (status2: WSStatus) => {
          expect(status2).toMatchObject({
            status: 'connected',
          });
          resolve();
        });
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

  it('waits a bit', async () => {
    // we have to wait a bit because Y.js debounces changes for ~1 second
    await timeout(2000);
  });

  it('can disconnect', async () => {
    await expect(
      new Promise<Status>((resolve) => {
        provider?.once('status', (event: WSStatus) => {
          resolve(event.status);
        });

        provider?.destroy();
        provider = undefined;
      })
    ).resolves.toEqual('disconnected');

    provider?.destroy();
    provider = undefined;
  });

  it('can connect back', async () => {
    const user = await ctx.auth();
    await new Promise<void>((resolve) => {
      doc = new YDoc();
      provider = createWebsocketProvider(doc, {
        protocol: user.token,
        connectBc: false,
        beforeConnect: (p) => {
          // eslint-disable-next-line no-param-reassign
          p.serverUrl = `${ctx.websocketURL()}?doc=${pad.id}`;
        },
      });

      provider.once('status', (status1: WSStatus) => {
        expect(status1).toMatchObject({
          status: 'connecting',
        });
        provider!.once('status', (status2: WSStatus) => {
          expect(status2).toMatchObject({
            status: 'connected',
          });
          resolve();
        });
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
