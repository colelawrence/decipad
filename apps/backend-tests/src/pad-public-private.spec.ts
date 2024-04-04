/* eslint-disable camelcase */
/* eslint-env jest */

import type { Workspace, Pad } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import type { Publish_State } from '@decipad/graphqlserver-types';

// Helper function so we get auto complete.
function getPublishState(x: Publish_State): Publish_State {
  return x;
}

test('public and private pads', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let pad: Pad;

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

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1" }
            ) {
              id
              name
              workspace {
                id
                name
              }
            }
          }
        `,
      })
    ).data.createPad;

    expect(pad).toMatchObject({
      name: 'Pad 1',
      workspace,
    });
  });

  it('other user cannot update', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            updatePad(id: "${pad.id}", pad: { name: "Pad 1 renamed" }) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('the creator can set to public', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const result = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            setPadPublic(id: "${pad.id}", publishState: ${getPublishState(
          'PUBLIC'
        )})
          }
      `,
      })
    ).data.setPadPublic;

    expect(result).toBeTruthy();

    const resultPad = (
      await client.query({
        query: ctx.gql`
        query {
          getPadById(id: "${pad.id}") {
            isPublic
          }
        }
      `,
      })
    ).data.getPadById;

    expect(resultPad.isPublic).toBeTruthy();
  });

  it('other still user cannot update', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            updatePad(id: "${pad.id}", pad: { name: "Pad 1 renamed" }) {
              id
              name
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('other user can get pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    const pad2 = (
      await client.query({
        query: ctx.gql`
          query {
            getPadById(id: "${pad.id}") {
              id
            }
          }
        `,
      })
    ).data.getPadById;

    expect(pad2).toMatchObject({
      id: pad.id,
    });
  });

  it('the creator can set to private', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const result = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            setPadPublic(id: "${pad.id}", publishState: ${getPublishState(
          'PRIVATE'
        )})
          }
      `,
      })
    ).data.setPadPublic;

    const resultPad = (
      await client.query({
        query: ctx.gql`
        query {
          getPadById(id: "${pad.id}") {
            isPublic
          }
        }
      `,
      })
    ).data.getPadById;

    expect(result).toBeTruthy();
    expect(resultPad.isPublic).toBeFalsy();
  });

  it('invited user can no longer get the pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.query({
        query: ctx.gql`
        query {
          getPadById(id: "${pad.id}") {
            id
            name
          }
        }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });
});
