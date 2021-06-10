/* eslint-env jest */

import waitForExpect from 'wait-for-expect';
import { ObservableSubscription } from '@apollo/client';
import test from './utils/test-with-sandbox';
import { timeout } from './utils/timeout';
import { withAuth, gql } from './utils/call-graphql';
import { withAuth as callSimpleWithAuth } from './utils/call-simple';
import auth from './utils/auth';
import createWebsocketLink from './utils/graphql-websocket-link';
import createDeciWebsocket from './utils/websocket';

test('workspaces changes', () => {
  const subscriptions: ObservableSubscription[] = [];
  const workspaces: Workspace[] = [];
  const inviteeWorkspaces: Workspace[] = [];
  let role: Role;
  let invites: RoleInvitation[];

  afterAll(() => {
    for (const sub of subscriptions) {
      sub.unsubscribe();
    }
  });

  it('can subscribe to workspace changes', async () => {
    await subscribe('test user id 1', workspaces, subscriptions);
  }, 15000);

  it('notifies you when you add a workspace', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          createWorkspace(workspace: { name: "Workspace 1" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0]).toMatchObject({
        name: 'Workspace 1',
      });
    }, 10000);
  }, 15000);

  it('notifies you when you remove a workspace', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removeWorkspace(id: "${workspaces[0].id}")
        }
      `,
    });

    await waitForExpect(() => {
      expect(workspaces).toHaveLength(0);
    }, 15000);
  }, 20000);

  it('notifies you when you add a workspace again', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          createWorkspace(workspace: { name: "Workspace 2" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0]).toMatchObject({
        name: 'Workspace 2',
      });
    }, 10000);
  }, 15000);

  it('notifies you when you update a workspace', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          updateWorkspace(id: "${workspaces[0].id}", workspace: { name: "Workspace 2 renamed" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0]).toMatchObject({
        name: 'Workspace 2 renamed',
      });
    }, 10000);
  }, 15000);

  it('allows admin to create role in workspace', async () => {
    const client = withAuth(await auth());
    role = (
      await client.mutate({
        mutation: gql`
          mutation {
            createRole(role: { name: "Role 1" workspaceId: "${workspaces[0].id}" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createRole;
    expect(role.id).toBeDefined();
  });

  it('allows admin to invite to role', async () => {
    const client = withAuth(await auth());
    invites = (
      await client.mutate({
        mutation: gql`
          mutation {
            inviteUserToRole(
              roleId: "${role.id}"
              userId: "test user id 2"
              permission: READ
            ) { id }
          }
        `,
      })
    ).data.inviteUserToRole;

    expect(invites).toHaveLength(2);
  });

  it('can subscribe to workspace changes', async () => {
    await subscribe('test user id 2', inviteeWorkspaces, subscriptions);
  }, 15000);

  it('allows receiving user to accept invitation for role', async () => {
    const invitesForUrl = invites.map((i) => i.id).join(',');
    const inviteAcceptLink = `http://localhost:3333/api/invites/${invitesForUrl}/accept`;
    const call = callSimpleWithAuth((await auth('test user id 2')).token);
    await call(inviteAcceptLink);

    await waitForExpect(() => {
      expect(inviteeWorkspaces).toHaveLength(1);
      expect(inviteeWorkspaces[0]).toMatchObject({
        name: 'Workspace 2 renamed',
      });
    }, 10000);
  }, 15000);

  it('notifies other user when you update a workspace', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          updateWorkspace(id: "${workspaces[0].id}", workspace: { name: "Workspace 2 renamed again" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteeWorkspaces).toHaveLength(1);
      expect(inviteeWorkspaces[0]).toMatchObject({
        name: 'Workspace 2 renamed again',
      });
    }, 10000);
  }, 15000);

  it('notifies other user when access is revoked', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removeUserFromRole(roleId: "${role.id}", userId: "test user id 2")
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteeWorkspaces).toHaveLength(0);
    }, 10000);

    // admin user still has workspace
    expect(workspaces).toHaveLength(1);
  }, 15000);
});

async function createClient(userId: string) {
  const { token } = await auth(userId);
  const link = createWebsocketLink(createDeciWebsocket(token), 120000);
  return withAuth({ token, link });
}

async function subscribe(
  userId: string,
  workspaces: Workspace[],
  subscriptions: ObservableSubscription[]
) {
  const client = await createClient(userId);
  const sub = client.subscribe({
    query: gql`
      subscription {
        workspacesChanged {
          added {
            id
            name
          }
          updated {
            id
            name
          }
          removed
        }
      }
    `,
  });

  subscriptions.push(
    await sub.subscribe({
      error(err) {
        throw err;
      },
      complete() {
        console.error('COMPLETE!');
      },
      next({ data }) {
        const changes = data.workspacesChanged;
        if (changes.added) {
          for (const w of changes.added) {
            workspaces.push(w);
          }
        }

        if (changes.updated) {
          for (const w of changes.updated) {
            const index = workspaces.findIndex(
              (w2: Workspace) => w2.id === w.id
            );
            expect(index).toBeGreaterThan(-1);
            workspaces[index] = Object.assign(workspaces[index], w);
          }
        }

        if (changes.removed) {
          for (const id of changes.removed) {
            const index = workspaces.findIndex((w) => id === w.id);
            expect(index).toBeGreaterThan(-1);
            workspaces.splice(index, 1);
          }
        }
      },
    })
  );

  await timeout(2000);
}
