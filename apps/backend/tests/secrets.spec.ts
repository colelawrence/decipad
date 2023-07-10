/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import { SecretRecord, Workspace, PadRecord } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import omit from 'lodash.omit';
import { ensureGraphqlResponseIsErrorFree } from './utils/ensureGraphqlResponseIsErrorFree';

test('secrets', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let secret: SecretRecord;
  let pad: PadRecord;

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
          createSecret(workspaceId: "${workspace.id}" secret: { name: "Secret1" secret: "secret content 1" }) {
            id
            name
          }
        }
      `,
      })
    ).data.createSecret;

    expect(secret).toMatchObject({
      name: 'Secret1',
    });
  });

  it('other user cannot create secret in workspace they dont belong to', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(() =>
      client.mutate({
        mutation: ctx.gql`
        mutation {
          createSecret(workspaceId: "${workspace.id}" secret: { name: "Secret2" secret: "secret content 2" }) {
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
      name: 'Secret1',
    });
  });

  it('owner can create notebook', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    pad = (
      await ensureGraphqlResponseIsErrorFree(
        client.mutate({
          mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1", icon: "icon" }
            ) {
              id
              name
            }
          }
        `,
        })
      )
    ).data.createPad;

    expect(pad).toMatchObject({
      name: 'Pad 1',
    });
  });

  it('the owner can proxy requests', async () => {
    const fetch = ctx.http.withAuth((await ctx.auth()).token);
    const result = await fetch(`/api/pads/${pad.id}/fetch`, {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://postman-echo.com/post?test={{secrets.Secret1}}',
        body: 'hey{{secrets.Secret1}}',
        method: 'POST',
        headers: {
          'X-Test': 'ABC{{secrets.Secret1}}',
        },
      }),
    });
    expect(result.status).toMatchInlineSnapshot(`200`);
    expect(
      omit(Object.fromEntries(Array.from(result.headers.entries())), 'date')
    ).toMatchInlineSnapshot(`
      {
        "connection": "close",
        "content-length": "652",
        "content-type": "text/plain; charset=utf-8",
      }
    `);
    const resultJson = await result.json();
    expect({
      ...resultJson,
      headers: omit(resultJson.headers, ['x-amzn-trace-id']),
    }).toMatchInlineSnapshot(`
      {
        "args": {
          "test": "secret content updated",
        },
        "data": "heysecret content updated",
        "files": {},
        "form": {},
        "headers": {
          "accept": "*/*",
          "accept-encoding": "gzip,deflate",
          "content-length": "25",
          "content-type": "text/plain;charset=UTF-8",
          "host": "postman-echo.com",
          "user-agent": "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
          "x-forwarded-port": "443",
          "x-forwarded-proto": "https",
          "x-test": "ABCsecret content updated",
        },
        "json": null,
        "url": "https://postman-echo.com/post?test=secret%20content%20updated",
      }
    `);
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
