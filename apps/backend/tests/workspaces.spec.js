'use strict';

/* eslint-env jest */

import test from './utils/test-with-sandbox';
import { withAuth, withoutAuth, gql } from './utils/call-graphql';
import { withAuth as callWithAuth } from './utils/call-simple';
import auth from './utils/auth';

test('workspaces', () => {
  let workspace;
  let role;
  let invitations;

  it('cannot create if not authenticated', async () => {
    const client = withoutAuth();
    await expect(
      client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth());
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

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  it('other user cannot update', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth());
    workspace = (
      await client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth());

    role = (
      await client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth('test user id 2'));

    await expect(
      client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth());

    invitations = (
      await client.mutate({
        mutation: gql`
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
    const call = callWithAuth(await auth());
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `http://localhost:3333/api/invites/${invitationIds}/accept`;

    await expect(call(link)).rejects.toThrow('Forbidden');
  });

  it('target user can accept invitation', async () => {
    const call = callWithAuth(await auth('test user id 2'));
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `http://localhost:3333/api/invites/${invitationIds}/accept`;

    await call(link);
  });

  it('admin user has user in role', async () => {
    const client = withAuth(await auth());

    const workspaces = (
      await client.query({
        query: gql`
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
    ).data.workspaces;

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
    const client = withAuth(await auth('test user id 2'));

    const workspaces = (
      await client.query({
        query: gql`
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
    ).data.workspaces;

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

  it('admin can remove user from role', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          removeUserFromRole(userId: "test user id 2" roleId: "${role.id}")
        }
      `,
    });
  });

  it('user no longer has access to workspace', async () => {
    const client = withAuth(await auth('test user id 2'));

    const workspaces = (
      await client.query({
        query: gql`
          query {
            workspaces {
              id
              name
            }
          }
        `,
      })
    ).data.workspaces;

    expect(workspaces).toMatchObject([]);
  });

  it('admin user can invite other user to a role again', async () => {
    const client = withAuth(await auth());

    invitations = (
      await client.mutate({
        mutation: gql`
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
    const call = callWithAuth(await auth('test user id 2'));
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `http://localhost:3333/api/invites/${invitationIds}/accept`;

    await call(link);
  });

  it('admin cannot remove role containing users', async () => {
    const client = withAuth(await auth());

    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            removeRole(roleId: "${role.id}")
          }
        `,
      })
    ).rejects.toThrow('Cannot remove role that has users in');
  });

  it('user can remove self from role', async () => {
    const client = withAuth(await auth('test user id 2'));

    await client.mutate({
      mutation: gql`
        mutation {
          removeSelfFromRole(roleId: "${role.id}")
        }
      `,
    });
  });

  it('user no longer has access to workspace', async () => {
    const client = withAuth(await auth('test user id 2'));

    const workspaces = (
      await client.query({
        query: gql`
          query {
            workspaces {
              id
              name
            }
          }
        `,
      })
    ).data.workspaces;

    expect(workspaces).toMatchObject([]);
  });

  it('admin can remove role', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          removeRole(roleId: "${role.id}")
        }
      `,
    });
  });

  it('sole admin cannot remove themselves from sole admin role', async () => {
    const client = withAuth(await auth());

    const workspaces = (
      await client.query({
        query: gql`
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
    ).data.workspaces;

    expect(workspaces).toHaveLength(1);
    const workspace = workspaces[0];
    const roles = workspace.roles;
    expect(roles).toHaveLength(1);
    const role = roles[0];
    expect(role.name).toBe('Administrator');

    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            removeSelfFromRole(roleId: "${role.id}")
          }
        `,
      })
    ).rejects.toThrow('Cannot remove sole admin');
  });
});
