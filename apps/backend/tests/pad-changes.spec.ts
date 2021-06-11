/* eslint-env jest */

import waitForExpect from 'wait-for-expect';
import test from './utils/test-with-sandbox';
import { timeout } from './utils/timeout';
import { withAuth, gql } from './utils/call-graphql';
import auth from './utils/auth';
import createWebsocketLink from './utils/graphql-websocket-link';
import createDeciWebsocket from './utils/websocket';
import { ObservableSubscription } from '@apollo/client';

test('pad changes', () => {
  let workspace: Workspace;
  const subscriptions: ObservableSubscription[] = [];
  const pads: Pad[] = [];
  const inviteepads: Pad[] = [];

  beforeAll(async () => {
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

  afterAll(() => {
    for (const sub of subscriptions) {
      sub.unsubscribe();
    }
  });

  it('can subscribe to pad changes', async () => {
    await subscribe('test user id 1', workspace.id, pads, subscriptions);
  }, 15000);

  it('notifies you when you add a pad', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
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
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(1);
      expect(pads[0]).toMatchObject({
        name: 'Pad 1',
      });
    }, 10000);
  }, 15000);

  it('notifies you when you remove a pad', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removePad(id: "${pads[0].id}")
        }
      `,
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(0);
    }, 15000);
  }, 20000);

  it('notifies you when you add a pad again', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          createPad(
            workspaceId: "${workspace.id}"
            pad: { name: "Pad 2" }
          ) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(1);
      expect(pads[0]).toMatchObject({
        name: 'Pad 2',
      });
    }, 10000);
  }, 15000);

  it('notifies you when you update a pad', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          updatePad(id: "${pads[0].id}", pad: { name: "Pad 2 renamed" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(1);
      expect(pads[0]).toMatchObject({
        name: 'Pad 2 renamed',
      });
    }, 10000);
  }, 15000);

  it('other user can subscribe to pads changes', async () => {
    await subscribe('test user id 2', workspace.id, inviteepads, subscriptions);
  }, 15000);

  it('allows admin to share with other user', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          sharePadWithUser(
            padId: "${pads[0].id}"
            userId: "test user id 2"
            permissionType: READ
            canComment: true
          )
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteepads).toHaveLength(1);
      expect(inviteepads[0]).toMatchObject({
        name: 'Pad 2 renamed',
      });
    }, 10000);
  }, 15000);

  it('notifies other user when you update a pad', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          updatePad(id: "${pads[0].id}", pad: { name: "Pad 2 renamed again" }) {
            id
            name
          }
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteepads).toHaveLength(1);
      expect(inviteepads[0]).toMatchObject({
        name: 'Pad 2 renamed again',
      });
    }, 10000);
  }, 15000);

  it('notifies other user when access is revoked', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          unsharePadWithUser(padId: "${pads[0].id}", userId: "test user id 2")
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteepads).toHaveLength(0);
    }, 10000);

    // admin user still has workspace
    expect(pads).toHaveLength(1);
  }, 15000);

  async function createClient(userId: string) {
    const { token } = await auth(userId);
    const link = createWebsocketLink(createDeciWebsocket(token), 120000);
    return withAuth({ token, link });
  }

  async function subscribe(
    userId: string,
    workspaceId: string,
    pads: Pad[],
    subscriptions: ObservableSubscription[]
  ) {
    const client = await createClient(userId);
    const sub = client.subscribe({
      query: gql`
        subscription {
          padsChanged(workspaceId: "${workspaceId}") {
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
          const changes = data.padsChanged;
          if (changes.added) {
            for (const w of changes.added) {
              pads.push(w);
            }
          }

          if (changes.updated) {
            for (const p of changes.updated) {
              const index = pads.findIndex((p2) => p2.id === p.id);
              expect(index).toBeGreaterThan(-1);
              pads[index] = Object.assign(pads[index], p);
            }
          }

          if (changes.removed) {
            for (const id of changes.removed) {
              const index = pads.findIndex((p) => id === p.id);
              expect(index).toBeGreaterThan(-1);
              pads.splice(index, 1);
            }
          }
        },
      })
    );

    await timeout(2000);
  }
});
