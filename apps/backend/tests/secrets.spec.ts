/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import { SecretRecord, Workspace } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

test('secrets', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let secret: SecretRecord;

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

  it('the creator can create secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    secret = (
      await client.mutate({
        mutation: ctx.gql`
        mutation {
          createSecret(workspaceId: "${workspace.id}" secret: { name: "Secret 1" secret: "secret content 1" }) {
            id
            name
          }
        }
      `,
      })
    ).data.createSecret;

    expect(secret).toMatchObject({
      name: 'Secret 1',
    });
  });

  it('other user cannot create secret in workspace they dont belong to', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(() =>
      client.mutate({
        mutation: ctx.gql`
        mutation {
          createSecret(workspaceId: "${workspace.id}" secret: { name: "Secret 2" secret: "secret content 2" }) {
            id
            name
          }
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the creator can update secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    secret = (
      await client.mutate({
        mutation: ctx.gql`
        mutation {
          updateSecret(secretId: "${secret.id}" secret: "secret content updated") {
            id
            name
          }
        }
      `,
      })
    ).data.updateSecret;

    expect(secret).toMatchObject({
      name: 'Secret 1',
    });
  });

  it('other user cannot update secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(() =>
      client.mutate({
        mutation: ctx.gql`
        mutation {
          updateSecret(secretId: "${secret.id}" secret: "secret content updated") {
            id
            name
          }
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('other user cannot remove secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(() =>
      client.mutate({
        mutation: ctx.gql`
        mutation {
          removeSecret(secretId: "${secret.id}")
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the creator can remove secret', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const result = (
      await client.mutate({
        mutation: ctx.gql`
        mutation {
          removeSecret(secretId: "${secret.id}")
        }
      `,
      })
    ).data.removeSecret;

    expect(result).toBe(true);
  });
});
