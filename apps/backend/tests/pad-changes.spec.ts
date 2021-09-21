/* eslint-env jest */

// existing sequential tests very granular
/* eslint-disable jest/expect-expect */

import waitForExpect from 'wait-for-expect';
import { Workspace, Pad } from '@decipad/backendtypes';
import { ObservableSubscription } from '@apollo/client';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { timeout } from './utils/timeout';

waitForExpect.defaults.interval = 250;

test('pad changes', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  const subscriptions: ObservableSubscription[] = [];
  const pads: Pad[] = [];
  const inviteepads: Pad[] = [];

  beforeAll(async () => {
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

  afterAll(() => {
    for (const sub of subscriptions) {
      sub.unsubscribe();
    }
  });

  it('can subscribe to pad changes', async () => {
    await subscribe('test user id 1', workspace.id, pads, subscriptions);
  });

  it('notifies you when you add a pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
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
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(1);
      expect(pads[0]).toMatchObject({
        name: 'Pad 1',
      });
    });
  });

  it('notifies you when you remove a pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removePad(id: "${pads[0].id}")
        }
      `,
    });

    await waitForExpect(() => {
      expect(pads).toHaveLength(0);
    });
  });

  it('notifies you when you add a pad again', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
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
    });
  });

  it('notifies you when you update a pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
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
    });
  });

  it('other user can subscribe to pads changes', async () => {
    await subscribe('test user id 2', workspace.id, inviteepads, subscriptions);
  });

  it('allows admin to share with other user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithUser(
            id: "${pads[0].id}"
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
    });
  });

  it('notifies other user when you update a pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
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
    });
  });

  it('notifies other user when access is revoked', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unsharePadWithUser(id: "${pads[0].id}", userId: "test user id 2")
        }
      `,
    });

    await waitForExpect(() => {
      expect(inviteepads).toHaveLength(0);
    });

    // admin user still has workspace
    expect(pads).toHaveLength(1);
  });

  async function subscribe(
    userId: string,
    workspaceId: string,
    targetPads: Pad[],
    targetSubscriptions: ObservableSubscription[]
  ) {
    const client = await ctx.subscriptionClient(userId);
    const sub = client.subscribe({
      query: ctx.gql`
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

    targetSubscriptions.push(
      sub.subscribe({
        error(err) {
          throw err;
        },
        complete() {
          // do nothing
        },
        next({ data }) {
          const changes = data.padsChanged;
          if (changes.added) {
            for (const w of changes.added) {
              targetPads.push(w);
            }
          }

          if (changes.updated) {
            for (const p of changes.updated) {
              const index = targetPads.findIndex((p2) => p2.id === p.id);
              expect(index).toBeGreaterThan(-1);
              // eslint-disable-next-line no-param-reassign
              targetPads[index] = Object.assign(targetPads[index], p);
            }
          }

          if (changes.removed) {
            for (const id of changes.removed) {
              const index = targetPads.findIndex((p) => id === p.id);
              expect(index).toBeGreaterThan(-1);
              targetPads.splice(index, 1);
            }
          }
        },
      })
    );

    // We have to wait because a subscription does not
    // wait for the server to reply.
    // Which means that we do a setTimeout and hope
    // that the subscription was created before it expires.
    await timeout(8000);
  }
});
