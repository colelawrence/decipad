/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import { Workspace, Role, RoleInvitation } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

test('workspaces', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let role: Role;
  let invitations: RoleInvitation[];

  it('cannot create if not authenticated', async () => {
    const client = ctx.graphql.withoutAuth();
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
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

  it('creator can get workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const workspace2 = (
      await client.query({
        query: ctx.gql`
          query {
            getWorkspaceById(id: "${workspace.id}") {
              id
              name
            }
          }
        `,
      })
    ).data.getWorkspaceById;

    expect(workspace2).toMatchObject({
      id: workspace.id,
      name: 'Workspace 1',
    });
  });

  it('other user cannot get', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.query({
        query: ctx.gql`
        query {
          getWorkspaceById(id: "${workspace.id}") {
            id
            name
          }
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('other user cannot update', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            updateWorkspace(id: "${workspace.id}", workspace: { name: "Workspace 1 renamed" }) {
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
    workspace = (
      await client.mutate({
        mutation: ctx.gql`
        mutation {
          updateWorkspace(id: "${workspace.id}", workspace: { name: "Workspace 1 renamed" }) {
            id
            name
          }
        }
      `,
      })
    ).data.updateWorkspace;

    expect(workspace).toMatchObject({
      name: 'Workspace 1 renamed',
    });
  });

  it('can create roles in the workspace', async () => {
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
        name: 'Workspace 1 renamed',
      },
      users: [],
    });
  });

  it('non-admin user cannot invite other user to a role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            inviteUserToRole(
              userId: "test user id 2"
              roleId: "${role.id}"
              permission: READ) {
                id
              }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('admin user can invite other user to a role', async () => {
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

  it('non-target user cannot accept invitation', async () => {
    const call = ctx.http.withAuth((await ctx.auth()).token);
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `/api/invites/${invitationIds}/accept`;

    await expect(call(link)).rejects.toThrow('Forbidden');
  });

  it('target user can accept invitation', async () => {
    const call = ctx.http.withAuth((await ctx.auth('test user id 2')).token);
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `/api/invites/${invitationIds}/accept`;

    await call(link);
  });

  it('admin user has user in role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
          query {
            workspaces {
              id
              name
              roles {
                id
                name
                users {
                  id
                }
              }
            }
          }
        `,
      })
    ).data;

    expect(workspaces).toMatchObject([
      {
        id: workspace.id,
        name: workspace.name,
        roles: [
          {
            id: role.id,
            name: role.name,
            users: [
              {
                id: 'test user id 2',
              },
            ],
          },
          {
            name: 'Administrator',
            users: [
              {
                id: 'test user id 1',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('invited user has self in role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
          query {
            workspaces {
              id
              name
              roles {
                id
                name
                users {
                  id
                }
              }
            }
          }
        `,
      })
    ).data;

    expect(workspaces).toMatchObject([
      {
        id: workspace.id,
        name: workspace.name,
        roles: [
          {
            id: role.id,
            name: role.name,
            users: [
              {
                id: 'test user id 2',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('invitee can get workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const workspace2 = (
      await client.query({
        query: ctx.gql`
          query {
            getWorkspaceById(id: "${workspace.id}") {
              id
              name
            }
          }
        `,
      })
    ).data.getWorkspaceById;

    expect(workspace2).toMatchObject({
      id: workspace.id,
      name: 'Workspace 1 renamed',
    });
  });

  it('admin can remove user from role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removeUserFromRole(userId: "test user id 2" roleId: "${role.id}")
        }
      `,
    });
  });

  it('user no longer has access to workspace after removed by admin', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
          query {
            workspaces {
              id
              name
            }
          }
        `,
      })
    ).data;

    expect(workspaces).toMatchObject([]);
  });

  it('admin user can invite other user to a role again', async () => {
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

  it('target user can accept the invitation again', async () => {
    const call = ctx.http.withAuth((await ctx.auth('test user id 2')).token);
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `/api/invites/${invitationIds}/accept`;

    await call(link);
  });

  it('admin cannot remove role containing users', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            removeRole(roleId: "${role.id}")
          }
        `,
      })
    ).rejects.toThrow('Cannot remove role that has users in');
  });

  it('user can remove self from role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removeSelfFromRole(roleId: "${role.id}")
        }
      `,
    });
  });

  it('user no longer has access to workspace after removing themselves', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
          query {
            workspaces {
              id
              name
            }
          }
        `,
      })
    ).data;

    expect(workspaces).toMatchObject([]);
  });

  it('admin user can share the workspace with another users email', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
          mutation {
            shareWorkspaceWithEmail(
              id: "${workspace.id}"
              email: "test2@decipad.com"
              permissionType: READ
              canComment: true) {
              id
            }
          }
        `,
    });
  });

  it('invitee can get workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const workspace2 = (
      await client.query({
        query: ctx.gql`
          query {
            getWorkspaceById(id: "${workspace.id}") {
              id
              name
            }
          }
        `,
      })
    ).data.getWorkspaceById;

    expect(workspace2).toMatchObject({
      id: workspace.id,
      name: 'Workspace 1 renamed',
    });
  });

  it('admin user can again share the workspace with the same user email and same permission', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
          mutation {
            shareWorkspaceWithEmail(
              id: "${workspace.id}"
              email: "test2@decipad.com"
              permissionType: READ
              canComment: true) {
              id
            }
          }
        `,
    });
  });

  it('invitee can still get workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const workspace2 = (
      await client.query({
        query: ctx.gql`
          query {
            getWorkspaceById(id: "${workspace.id}") {
              id
              name
              myPermissionType
            }
          }
        `,
      })
    ).data.getWorkspaceById;

    expect(workspace2).toMatchObject({
      id: workspace.id,
      name: 'Workspace 1 renamed',
      myPermissionType: 'READ',
    });
  });

  it('admin user can again share the workspace with the same user email but write permission', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
          mutation {
            shareWorkspaceWithEmail(
              id: "${workspace.id}"
              email: "test2@decipad.com"
              permissionType: WRITE
              canComment: true) {
              id
            }
          }
        `,
    });
  });

  it('invitee can now write to that workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const workspace2 = (
      await client.query({
        query: ctx.gql`
          query {
            getWorkspaceById(id: "${workspace.id}") {
              id
              name
              myPermissionType
            }
          }
        `,
      })
    ).data.getWorkspaceById;

    expect(workspace2).toMatchObject({
      id: workspace.id,
      name: 'Workspace 1 renamed',
      myPermissionType: 'WRITE',
    });
  });

  it('admin can remove role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removeRole(roleId: "${role.id}")
        }
      `,
    });
  });

  it('sole admin cannot remove themselves from sole admin role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
          query {
            workspaces {
              id
              name
              roles {
                id
                name
              }
            }
          }
        `,
      })
    ).data;

    expect(workspaces).toHaveLength(1);
    const soleWorkspace = workspaces[0];
    const { roles } = soleWorkspace;
    expect(roles).toHaveLength(1);
    const soleRole = roles[0];
    expect(soleRole.name).toBe('Administrator');

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            removeSelfFromRole(roleId: "${soleRole.id}")
          }
        `,
      })
    ).rejects.toThrow('Cannot remove sole admin');
  });
});
