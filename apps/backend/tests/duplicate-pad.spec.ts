/* eslint-env jest */

import { Workspace, Pad } from '@decipad/backendtypes';
import test from './utils/test-with-sandbox';
import { withAuth, gql } from './utils/call-graphql';
import { withAuth as restWithAuth } from './utils/call-simple';
import { encode } from './utils/resource';
import auth from './utils/auth';

test('duplicate pads', () => {
  let workspace: Workspace;
  let pad: Pad;
  let authRes: any;

  beforeAll(async () => {
    authRes = await auth();
    const client = withAuth(authRes);
    workspace = (
      await client.mutate({
        mutation: gql`
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
        mutation: gql`
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
    const client = withAuth(authRes);

    const call = restWithAuth(authRes.token);
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
      mutation: gql`
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
    const unauthorizedClient = withAuth(await auth('test user id 2'));
    await expect(
      unauthorizedClient.mutate({
        mutation: gql`
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
