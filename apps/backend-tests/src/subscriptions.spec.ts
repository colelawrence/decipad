/* eslint-env jest */
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import {
  getMetadata,
  createWorkspaceSubscription,
} from '../../../libs/services/src/subscriptions';
import { queryAccessibleResources } from '../../../libs/services/src/permissions';
import { justCreateUser } from '../../../libs/services/src/users/justCreateUser';
import { getDefined } from '@decipad/utils';
import { nanoid } from 'nanoid';

test('Subscription edges', (ctx) => {
  let userId = '';
  let workspaceId = '';

  beforeAll(async () => {
    const testUser = await justCreateUser({
      name: 'test user',
      email: 'test@email.com',
    });
    userId = testUser.id;

    const user = await ctx.auth(userId);
    userId = getDefined(user.user?.id);

    const client = ctx.graphql.withAuth(user);

    const userWorkspaces = await queryAccessibleResources({
      userId,
      resourceType: 'workspaces',
      parentResourceUri: null,
    });

    expect(userWorkspaces).toHaveLength(0);

    const ws = (
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

    workspaceId = ws.id;
  });

  it('cannot create another free workspace', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth(userId));

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Free Workspace" }) {
              id
            }
          }
        `,
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"User already has a free workspace. Cannot create another"`
    );
  });

  it('can create a new free workspace if upgraded previous free one', async () => {
    await createWorkspaceSubscription({
      subscription: nanoid(),
      client_reference_id: workspaceId,
      customer_details: { email: 'email@n1n.co' } as any,
      payment_status: 'paid',
      payment_link: 'payment_link',
      metadata: getMetadata({
        key: 'personal',
        credits: 10,
        queries: 10,
        storage: 10,
        seats: 10,
      }),
    });

    const client = ctx.graphql.withAuth(await ctx.auth(userId));

    const workspace = (
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

    expect(workspace.id).toBeDefined();
    expect(typeof workspace.id).toBe('string');
  });
});
