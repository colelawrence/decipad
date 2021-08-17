/* eslint-env jest */

import { Workspace, Pad } from '@decipad/backendtypes';
import test from './sandbox';
import { encode } from './utils/resource';

test('duplicate pads', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let pad: Pad;
  // TODO type auth result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authRes: any;

  beforeAll(async () => {
    authRes = await ctx.auth();
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

  it('can duplicate a pad', async () => {
    const client = ctx.graphql.withAuth(authRes);

    const call = ctx.http.withAuth(authRes.token);
    await call(`/api/syncdoc/${encode(`/pads/${pad.id}/content`)}`, {
      method: 'PUT',
      body: 'test pad contents!',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const {
      data: { duplicatePad },
    } = await client.mutate({
      mutation: ctx.gql`
        mutation {
          duplicatePad(id: "${pad.id}") {
            id
            name
            workspace {
              id
              name
            }
            access {
              users {
                user { id }
                permission
              }
            }
          }
        }
      `,
    });

    expect(duplicatePad.id).not.toEqual(pad.id);
    expect(duplicatePad).toMatchObject({
      name: 'Copy of Pad 1',
      workspace: pad.workspace,
    });
    expect(duplicatePad.access).toMatchObject({
      users: [
        {
          user: { id: authRes.user.id },
          permission: 'ADMIN',
        },
      ],
    });

    const content = await (
      await call(`/api/syncdoc/${encode(`/pads/${duplicatePad.id}/content`)}`)
    ).text();
    expect(content).toEqual('test pad contents!');
  });

  it('refuses to duplicate a pad if you do not have access to it', async () => {
    const unauthorizedClient = ctx.graphql.withAuth(
      await ctx.auth('test user id 2')
    );
    await expect(
      unauthorizedClient.mutate({
        mutation: ctx.gql`
          mutation {
            duplicatePad(id: "${pad.id}") {
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
    ).rejects.toThrow('Forbidden');
  });
});
