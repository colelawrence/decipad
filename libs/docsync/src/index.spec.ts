/* eslint-disable no-console */
/* eslint-disable jest/no-done-callback */
/* eslint-disable jest/expect-expect */
import { Pad } from '@decipad/backendtypes';
import { MyEditor } from '@decipad/editor-types';
import fetch from 'jest-fetch-mock';
import waitForExpect from 'wait-for-expect';
import { createDocSyncEditor, DocSyncEditor } from '.';
import { testWithSandbox as test } from '../../backend-test-sandbox/src';
import { clone } from './utils/clone';
import { randomChangesToEditors } from './utils/random-changes';

waitForExpect.defaults.interval = 500;
const replicaCount = 3;
const randomChangeCountPerReplica = 50;

test('sync many', (ctx) => {
  const editors: DocSyncEditor[] = [];
  let pad: Pad;

  beforeAll(async () => {
    fetch.disableMocks();
    const authRes = await ctx.auth();
    const client = ctx.graphql.withAuth(authRes);
    const workspace = (
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
    for (const editor of editors) {
      editor.destroy();
    }
  });

  it('all editors connect', async () => {
    const auth = await ctx.auth();
    fetch.mockClear();
    fetch.enableMocks();
    fetch.mockResponse(async (req) => {
      const { pathname } = new URL(req.url);
      switch (pathname) {
        case '/api/ws': {
          return ctx.websocketURL();
        }
        case '/api/auth/token': {
          return auth.token;
        }
        default:
          throw new Error(`Unknown pathname${pathname}`);
      }
    });
    fetch.mockIf((req) => {
      const { pathname } = new URL(req.url);
      return pathname.startsWith('/api');
    });

    for (let i = 0; i < replicaCount; i += 1) {
      const editor = createDocSyncEditor(pad.id, {
        connectBc: false,
      });
      editors.push(editor);
    }

    await Promise.all(
      editors.map(
        (editor) =>
          new Promise<void>((resolve) => {
            editor.onConnected(resolve);
          })
      )
    );
  });

  it('makes random changes to the editors and pad contents converge', async () => {
    expect(editors.length).toBeGreaterThan(0);
    await randomChangesToEditors(
      editors as unknown as Array<MyEditor>,
      randomChangeCountPerReplica
    );

    await waitForExpect(async () => {
      const expectedContents = clone(editors[0].children);
      expect(editors.length).toBe(replicaCount);
      for (const editor2 of editors.slice(1)) {
        expect(editor2.children).toMatchObject(expectedContents);
      }
    }, 50000);
    expect(editors[0].children.length).toBeGreaterThan(0);
  }, 60000);
});
