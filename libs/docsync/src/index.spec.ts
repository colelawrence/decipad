/* eslint-disable no-console */
/* eslint-disable jest/no-done-callback */
/* eslint-disable jest/expect-expect */
import waitForExpect from 'wait-for-expect';
import { createEditor } from 'slate';
import fetch from 'jest-fetch-mock';
import { Pad } from '@decipad/backendtypes';
import { testWithSandbox as test } from '../../backend-test-sandbox/src';
import { randomChangesToEditors } from './utils/random-changes';
import { clone } from './utils/clone';
import { withDocSync, DocSyncEditor } from '.';

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
      switch (req.url) {
        case 'http://localhost:4200/api/ws': {
          return ctx.websocketURL();
        }
        case 'http://localhost:4200/api/auth/token?for=pubsub': {
          return auth.token;
        }
        default:
          throw new Error(`Unknown URL${req.url}`);
      }
    });
    fetch.mockIf((req) => req.url.startsWith('http://localhost:4200/api'));

    for (let i = 0; i < replicaCount; i += 1) {
      const editor = withDocSync(createEditor(), pad.id, {
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
    await randomChangesToEditors(editors, randomChangeCountPerReplica);

    console.log('random changes completed');

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
