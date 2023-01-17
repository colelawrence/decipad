/* eslint-env jest */

// existing sequential tests very granular
/* eslint-disable jest/expect-expect */

import arc from '@architect/functions';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { Pad, Role, RoleInvitation, Workspace } from '@decipad/backendtypes';
import { timeout } from './utils/timeout';

test('pads', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let role: Role;
  let invitations: RoleInvitation[];
  let pad: Pad;
  let targetUserId: string;
  let secret: string;

  beforeAll(async () => {
    const auth = await ctx.auth();
    const client = ctx.graphql.withAuth(auth);

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

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    role = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createRole(role: {
              name: "read-only role"
              workspaceId: "${workspace.id}"
            }) {
                id
                name
                workspace {
                  id
                  name
                }
                users {
                  id
                  name
                }
              }
          }
      `,
      })
    ).data.createRole;

    expect(role).toMatchObject({
      name: 'read-only role',
      workspace: {
        id: workspace.id,
        name: 'Workspace 1',
      },
      users: [],
    });
  });

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    invitations = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            inviteUserToRole(userId: "test user id 2" roleId: "${role.id}" permission: READ) {
              id
              expires_at
            }
          }
        `,
      })
    ).data.inviteUserToRole;
  });

  beforeAll(async () => {
    const call = ctx.http.withAuth((await ctx.auth('test user id 2')).token);
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `/api/invites/${invitationIds}/accept`;
    await call(link);
  });

  it('cannot create if not authenticated', async () => {
    const client = ctx.graphql.withoutAuth();
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1" }
            ) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  }, 20000);

  it('cannot create if workspace does not exist', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "workspace id does not exist"
              pad: { name: "Pad 1" }
            ) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('can create', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1", icon: "icon" }
            ) {
              id
              name
              icon
              workspace {
                id
                name
              }
              access {
                secrets {
                  permission
                  secret
                }
              }
            }
          }
        `,
      })
    ).data.createPad;

    expect(pad).toMatchObject({
      name: 'Pad 1',
      workspace,
    });
  });

  it('other user cannot update', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            updatePad(id: "${pad.id}", pad: { name: "Pad 1 renamed" }) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the creator can update', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            updatePad(id: "${pad.id}", pad: { name: "Pad 1 renamed", icon: "icon updated" }) {
              id
              name
              icon
            }
          }
      `,
      })
    ).data.updatePad;

    expect(pad).toMatchObject({
      name: 'Pad 1 renamed',
      icon: 'icon updated',
    });
  });

  it('creator can get pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const pad2 = (
      await client.query({
        query: ctx.gql`
          query {
            getPadById(id: "${pad.id}") {
              id
              name
              icon
              createdAt
            }
          }
        `,
      })
    ).data.getPadById;

    expect(pad2).toMatchObject({
      id: pad.id,
      name: 'Pad 1 renamed',
      icon: 'icon updated',
    });

    expect(pad2.createdAt).toBeDefined();
  });

  it('invited user cannot get the pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.query({
        query: ctx.gql`
        query {
          getPadById(id: "${pad.id}") {
            id
            name
          }
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the creator can share a notebook with secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const result = await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithSecret(id: "${pad.id}", permissionType: READ, canComment: false)
        }
      `,
    });

    secret = result.data.sharePadWithSecret;

    expect(result.data.sharePadWithSecret).toBeTruthy();
  });

  it('the creator can unshare a notebook with secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const result = await client.mutate({
      mutation: ctx.gql`
        mutation {
          unshareNotebookWithSecret(id: "${pad.id}", secret: "${secret}")
        }
      `,
    });

    expect(result.data.unshareNotebookWithSecret).toBe(true);
  });

  it('the creator can share pad with role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithRole (
            id: "${pad.id}"
            roleId: "${role.id}"
            permissionType: READ
            canComment: true)
        }
      `,
    });
  });

  it('waits for share', async () => timeout(1000));

  it.skip('invitee can get pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const pad2 = (
      await client.query({
        query: ctx.gql`
          query {
            getPadById(id: "${pad.id}") {
              id
              name
            }
          }
        `,
      })
    ).data.getPadById;

    expect(pad2).toMatchObject({
      id: pad.id,
      name: 'Pad 1 renamed',
    });
  });

  it('the target user does not have write access to pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            updatePad(id: "${pad.id}", pad: { name: "Pad 1 renamed again" }) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the target user cannot share pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            sharePadWithRole (
              id: "${pad.id}"
              roleId: "${role.id}"
              permissionType: WRITE
              canComment: true)
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('admin can unshare with role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unsharePadWithRole(id: "${pad.id}" roleId: "${role.id}")
        }
      `,
    });
  });

  it('waits for unshare', async () => timeout(1000));

  it('target user no longer has access to pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { pads } = (
      await client.query({
        query: ctx.gql`
          query {
            pads(workspaceId: "${workspace.id}", page: { maxItems: 10 }) {
              items { id name }
              count
              hasNextPage
            }
          }
        `,
      })
    ).data;

    expect(pads).toMatchObject({
      items: [],
      count: 0,
      hasNextPage: false,
    });
  });

  it('admin user can share with other user directly', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithUser (
            id: "${pad.id}"
            userId: "test user id 2"
            permissionType: READ
            canComment: true)
        }
      `,
    });
  });

  it('target can access pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { pads } = (
      await client.query({
        query: ctx.gql`
          query {
            pads(workspaceId: "${workspace.id}", page: { maxItems: 10 }) {
              items { id name }
              count
              hasNextPage
            }
          }
        `,
      })
    ).data;

    expect(pads).toMatchObject({
      items: [{ name: 'Pad 1 renamed' }],
      count: 1,
      hasNextPage: false,
    });
  });

  it('admin user can revoke access to pad after share', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unsharePadWithUser (
            id: "${pad.id}"
            userId: "test user id 2"
          )
        }
      `,
    });
  });

  it('target user no longer can access pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { pads } = (
      await client.query({
        query: ctx.gql`
          query {
            pads(workspaceId: "${workspace.id}", page: { maxItems: 10 }) {
              items { id name }
              count
              hasNextPage
            }
          }
        `,
      })
    ).data;

    expect(pads).toMatchObject({
      items: [],
      count: 0,
      hasNextPage: false,
    });
  });

  it('admin can invite using existing email', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const result = await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithEmail (
            id: "${pad.id}"
            email: "test2@decipad.com"
            permissionType: READ
            canComment: true) {
              id
              access {
                users {
                  permission
                }
              }
            }
        }
      `,
    });

    const updatedPad = result.data.sharePadWithEmail;
    expect(updatedPad).toMatchObject({
      id: pad.id,
      access: {
        users: [
          {
            __typename: 'UserAccess',
            permission: 'READ',
          },
          {
            __typename: 'UserAccess',
            permission: 'ADMIN',
          },
        ],
      },
    });
  });

  it('admin user can revoke access to pad after invite', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unsharePadWithUser (
            id: "${pad.id}"
            userId: "test user id 2"
          )
        }
      `,
    });
  });

  it('admin can invite unregistered user using email', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const result = await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithEmail (
            id: "${pad.id}"
            email: "test100@decipad.com"
            permissionType: READ
            canComment: true)
          {
            id
          }
        }
      `,
    });

    const updatedPad = result.data.sharePadWithEmail;
    expect(updatedPad).toMatchObject({ id: pad.id });
  });

  it('unregistered user can accept invite', async () => {
    const data = await arc.tables();

    const key = await data.userkeys.get({ id: `email:test100@decipad.com` });
    expect(key).toBeDefined();

    targetUserId = key.user_id;
    const invites = (
      await data.invites.query({
        IndexName: 'byUser',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': targetUserId,
        },
      })
    ).Items;

    expect(invites).toHaveLength(1);
    const invite = invites[0];
    const inviteAcceptLink = `/api/invites/${invite.id}/accept`;

    const call = ctx.http.withAuth((await ctx.auth(targetUserId)).token);
    await call(inviteAcceptLink);
  });

  it('read only user cannot remove pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth(targetUserId));

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            removePad (
              id: "${pad.id}"
            )
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('admin can remove pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removePad(id: "${pad.id}")
        }
      `,
    });
  });
});
