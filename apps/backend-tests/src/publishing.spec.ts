import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { create } from '../../../libs/services/src/notebooks/create';
import { putPad } from '../../../libs/services/src/notebooks/helpers';
import { justCreateUser } from '../../../libs/services/src/users/justCreateUser';
import { ensureGraphqlResponseIsErrorFree } from './utils/ensureGraphqlResponseIsErrorFree';

import * as Y from 'yjs';
import type { TOperation } from '@udecode/plate-common';
import { applySlateOps } from '@decipad/slate-yjs';

const slateYjsSymbol = Symbol('slate-yjs');

function getTestPadState() {
  const doc = new Y.Doc();

  const ops: Array<TOperation> = [
    {
      type: 'insert_node',
      path: [0],
      node: { type: 'title', children: [{ text: 'test title' }] },
    },
  ];

  applySlateOps(doc.getArray(), ops, slateYjsSymbol);

  const buf = Y.encodeStateAsUpdate(doc);
  return Buffer.from(buf).toString('base64');
}

test('Publishing and duplication', (ctx) => {
  let workspaceId = '';
  let padId = '';

  beforeAll(async () => {
    const otherUser = await justCreateUser({
      name: 'other test user',
      email: 'other@user.com',
    });

    const otherClient = ctx.graphql.withAuth(await ctx.auth(otherUser.id));
    const client = ctx.graphql.withAuth(await ctx.auth());

    const ws = (
      await otherClient.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Free Workspace" }) {
              id
            }
          }
        `,
      })
    ).data.createWorkspace;

    expect(ws.id).toBeDefined();
    expect(typeof ws.id).toBe('string');

    const myWorkspace = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Free Workspace" }) {
              id
            }
          }
        `,
      })
    ).data.createWorkspace;

    expect(ws.id).toBeDefined();
    expect(typeof ws.id).toBe('string');

    workspaceId = myWorkspace.id;

    const pad = await create(ws.id, { name: 'test pad' }, undefined);
    padId = pad.id;

    await ensureGraphqlResponseIsErrorFree(
      otherClient.mutate({
        mutation: ctx.gql`
        mutation {
          createOrUpdateSnapshot(params: {
            notebookId: "${padId}",
            snapshotName: "Published 1",
            remoteState: "${getTestPadState()}"
          })
        }`,
      })
    );
  });

  it('cannot duplicate the pad by default', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await expect(() =>
      ensureGraphqlResponseIsErrorFree(
        client.mutate({
          mutation: ctx.gql`
          mutation {
            duplicatePad(id: "${padId}", targetWorkspace: "${workspaceId}") {
              id
            }
          }`,
        })
      )
    ).rejects.toThrow();
  });

  it('can duplicate a pad if pad is fully public', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await putPad(padId, { isPublic: true, userAllowsPublicHighlighting: true });

    const res = await ensureGraphqlResponseIsErrorFree(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            duplicatePad(id: "${padId}", targetWorkspace: "${workspaceId}") {
              id
            }
          }`,
      })
    );

    expect(res.data.duplicatePad).toMatchObject({ id: expect.any(String) });
  });

  it('can duplicate pad by default is only is public', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await putPad(padId, {
      isPublic: true,
      userAllowsPublicHighlighting: undefined,
    });

    const res = await ensureGraphqlResponseIsErrorFree(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            duplicatePad(id: "${padId}", targetWorkspace: "${workspaceId}") {
              id
            }
          }`,
      })
    );

    expect(res.data.duplicatePad).toMatchObject({ id: expect.any(String) });
  });

  it('cannot duplicate pad if flag is off', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await putPad(padId, {
      isPublic: true,
      userAllowsPublicHighlighting: false,
      canPublicDuplicate: false,
    });

    await expect(() =>
      ensureGraphqlResponseIsErrorFree(
        client.mutate({
          mutation: ctx.gql`
          mutation {
            duplicatePad(id: "${padId}", targetWorkspace: "${workspaceId}") {
              id
            }
          }`,
        })
      )
    ).rejects.toThrow();
  });
});
