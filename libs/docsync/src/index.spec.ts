/* eslint-disable no-console */
/* eslint-disable jest/no-done-callback */
/* eslint-disable jest/expect-expect */
import { Pad } from '@decipad/backendtypes';
import fetch from 'jest-fetch-mock';
import waitForExpect from 'wait-for-expect';
import { createDocSyncEditor, DocSyncEditor } from '.';
import { testWithSandbox as test } from '../../backend-test-sandbox/src';
import { clone } from './utils/clone';
import { randomChangesToEditors } from './utils/random-changes';
import { EditorController } from '@decipad/notebook-tabs';

waitForExpect.defaults.interval = 500;
const replicaCount = 5;
const randomChangeCountPerReplica = 50;

let mockCounter = 0;
jest.mock('nanoid', () => {
  return {
    nanoid: () => {
      // eslint-disable-next-line no-plusplus
      const id = mockCounter++;
      return id.toString();
    },
  };
});

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

  afterAll(() => {
    for (const editor of editors) {
      editor.destroy();
    }
  });

  it('all editors connect', async () => {
    const auth = await ctx.auth();
    fetch.mockClear();
    fetch.enableMocks();
    // eslint-disable-next-line require-await
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
        protocolVersion: 2,
        controller: new EditorController(pad.id, []),
        // initialState: EMPTY_INITIAL_NOTEBOOK,
      });
      editors.push(editor);
    }

    await Promise.all(
      editors.map(
        (editor) =>
          new Promise<void>((resolve) => {
            editor.onConnected(() => {
              resolve();
            });
          })
      )
    );

    editors[0].editorController.Loaded('test');
  });

  it('makes random changes to the editors and pad contents converge', async () => {
    expect(editors.length).toBeGreaterThan(0);

    await waitForExpect(
      () => {
        for (const editor of editors) {
          expect(editor.editorController.children).toHaveLength(2);
        }
      },
      20000,
      5000
    );

    await randomChangesToEditors(
      editors.map((e) => e.editorController.SubEditors[0]),
      randomChangeCountPerReplica
    );

    const firstEditor = editors[0].editorController.children;
    expect(firstEditor.filter((e) => e.type === 'title')).toHaveLength(1);
    expect(firstEditor.filter((e) => e.type === 'tab')).toHaveLength(1);

    await waitForExpect(() => {
      const expectedContents = clone(firstEditor);

      expect(editors.length).toBe(replicaCount);

      for (const editor2 of editors.slice(1)) {
        expect(editor2.editorController.children).toMatchObject(
          expectedContents
        );
      }
    }, 10000);
    expect(editors[0].editorController.children.length).toBeGreaterThan(0);
  }, 20000);
});
