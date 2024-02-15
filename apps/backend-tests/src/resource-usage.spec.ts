import { limits } from '@decipad/backend-config';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { Workspace } from '@decipad/graphqlserver-types';
import * as resourceusage from '../../../libs/services/src/resource-usage';

// Otherwise debugging becomes very strange.
jest.retryTimes(1);

test('AI Usage', (ctx) => {
  let workspace: Workspace;
  let secondWorkspace: Workspace;

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

    secondWorkspace = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 2" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createWorkspace;

    expect(secondWorkspace).toMatchObject({ name: 'Workspace 2' });

    expect(workspace.id).not.toBe(secondWorkspace.id);
  });

  it('returns an empty record for user with no usage', async () => {
    await expect(resourceusage.getAiUsage(workspace.id)).resolves.toBe(0);
  });

  it('returns 0 remaining credits if no extra credits were purchased', async () => {
    await expect(
      resourceusage.getRemainingExtraCredits(workspace.id)
    ).resolves.toBe(0);
  });

  it('returns correct limits for workspace', async () => {
    await expect(resourceusage.getLimit(workspace.id)).resolves.toMatchObject({
      openai: 50,
      storage: 10,
    });
  });

  it('returns correct usage after inserting', async () => {
    await resourceusage.updateWorkspaceAndUserAi({
      workspaceId: workspace.id,
      usage: {
        completion_tokens: 2000,
        prompt_tokens: 3000,
        total_tokens: 5000,
      },
    });

    await expect(resourceusage.getAiUsage(workspace.id)).resolves.toBe(
      (2000 + 3000) / limits().tokensToCredits
    );
  });

  it(`allows the user to go over their limit,
    to avoid errors such as: 49.9 / 50 used,
    but user being unable to use the last 0.1`, async () => {
    // This is exageratted, but technically possible.
    // In reality the overflow would never be this big.
    await resourceusage.upsertAi(
      workspace.id,
      'completionTokensUsed',
      100000000
    );

    await expect(resourceusage.getAiUsage(workspace.id)).resolves.toBe(50);

    await expect(
      resourceusage.hasReachedLimit('openai', workspace.id)
    ).resolves.toBeTruthy();
  });

  it('returns 0 for extra AI credits, if user has purchased none', async () => {
    await expect(
      resourceusage.getRemainingExtraCredits(workspace.id)
    ).resolves.toBe(0);
  });

  it('allows user to spend more credits if they buy credits', async () => {
    await resourceusage.insertExtraAi(workspace.id, 50);

    await expect(
      resourceusage.getUsageRecord(
        'openai/extra-credits/null/workspaces',
        workspace.id
      )
    ).resolves.toMatchObject({
      createdAt: expect.any(Number),
      id: expect.any(String),
      consumption: 0,
      originalAmount: 50,
    });

    await expect(
      resourceusage.hasReachedLimit('openai', workspace.id)
    ).resolves.toBeFalsy();

    await expect(
      resourceusage.getRemainingExtraCredits(workspace.id)
    ).resolves.toBe(50);
  });

  it('Allows user to spend their extra credits', async () => {
    await resourceusage.upsertAi(
      workspace.id,
      'promptTokensUsed',
      25 * limits().tokensToCredits
    );

    await expect(
      resourceusage.getRemainingExtraCredits(workspace.id)
    ).resolves.toBe(25);
    await expect(resourceusage.getAiUsage(workspace.id)).resolves.toBe(75);
  });

  it('Edge case: Can buy multiple extra AI credits', async () => {
    await resourceusage.insertExtraAi(secondWorkspace.id, 50);
    await resourceusage.insertExtraAi(secondWorkspace.id, 25);

    await expect(
      resourceusage.getLimit(secondWorkspace.id)
    ).resolves.toMatchObject({
      openai: 50 + 50 + 25,
      openaiExtraCredits: 75,
    });

    await expect(resourceusage.getAiUsage(secondWorkspace.id)).resolves.toBe(0);
  });

  it('Edge case: Can spend multiple AI credits', async () => {
    await resourceusage.upsertAi(
      secondWorkspace.id,
      'promptTokensUsed',
      60 * limits().tokensToCredits
    );

    // note how we dont dip into extra credits,
    // because we dont count the usage overflow (this is very small usually)

    await expect(resourceusage.getAiUsage(secondWorkspace.id)).resolves.toBe(
      50
    );
    await expect(
      resourceusage.getRemainingExtraCredits(secondWorkspace.id)
    ).resolves.toBe(75);

    await resourceusage.upsertAi(
      secondWorkspace.id,
      'completionTokensUsed',
      80 * limits().tokensToCredits
    );

    await expect(
      resourceusage.hasReachedLimit('openai', secondWorkspace.id)
    ).resolves.toBeTruthy();
    await expect(
      resourceusage.getRemainingExtraCredits(secondWorkspace.id)
    ).resolves.toBe(0);
  });
});
