import { beforeAll, expect } from 'vitest';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import type { Workspace } from '@decipad/backendtypes';
import { ensureGraphqlResponseIsErrorFree } from './utils/ensureGraphqlResponseIsErrorFree';

test('workspaces', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;

  beforeAll(async () => {
    const auth = await ctx.auth();
    const client = ctx.graphql.withAuth(auth);

    workspace = (
      await ensureGraphqlResponseIsErrorFree(
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
      )
    ).data.createWorkspace;

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  it('can create a workspace', async () => {
    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('Workspace 1');
  });

  it('can query workspace resource usage', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const response = await ensureGraphqlResponseIsErrorFree(
      client.query({
        query: ctx.gql`
          query {
            getResourceUsage(workspaceId: "${workspace.id}") {
              consumption
              resourceType
            }
          }
        `,
      })
    );

    expect(response.data.getResourceUsage).toBeDefined();
  });

  it('can get workspace subscription plans', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const response = await ensureGraphqlResponseIsErrorFree(
      client.query({
        query: ctx.gql`
          query {
            getSubscriptionsPlans {
              id
              key
              title
              price
              currency
            }
          }
        `,
      })
    );

    expect(response.data.getSubscriptionsPlans).toBeDefined();
    expect(Array.isArray(response.data.getSubscriptionsPlans)).toBe(true);
  });

  it('can get credits plans', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const response = await ensureGraphqlResponseIsErrorFree(
      client.query({
        query: ctx.gql`
          query {
            getCreditsPlans {
              id
              key
              title
              price
              currency
            }
          }
        `,
      })
    );

    expect(response.data.getCreditsPlans).toBeDefined();
    expect(Array.isArray(response.data.getCreditsPlans)).toBe(true);
  });
});
