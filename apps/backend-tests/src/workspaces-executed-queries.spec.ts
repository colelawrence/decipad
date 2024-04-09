/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import type { Workspace } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { limits } from '@decipad/backend-config';

test('Executed queries', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let workspaceQueryCount;

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
  });

  it('can increment the query count for the first time', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    workspaceQueryCount = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            incrementQueryCount(id: "${workspace.id}") {
              queryCount
              quotaLimit
            }
          }
        `,
      })
    ).data.incrementQueryCount;
    expect(workspaceQueryCount.queryCount).toBe(1);
    expect(workspaceQueryCount.quotaLimit).toBe(limits().maxQueries.free);
  });
});
