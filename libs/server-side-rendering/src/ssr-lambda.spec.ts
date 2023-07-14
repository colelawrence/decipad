/* eslint-disable import/no-extraneous-dependencies */
import 'cross-fetch/polyfill';
import { Pad } from '@decipad/backendtypes';
import {
  testWithSandbox as test,
  AuthReturnValue,
} from '@decipad/backend-test-sandbox';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { distance } from 'fastest-levenshtein';

test('sync many', (ctx) => {
  let pad: Pad;
  let userAuth: AuthReturnValue;

  beforeAll(async () => {
    userAuth = await ctx.auth();
    const client = ctx.graphql.withAuth(userAuth);
    const workspace = (
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

    const source = Buffer.from(
      JSON.stringify(
        JSON.parse(
          readFileSync(
            join(__dirname, '..', '__fixtures__', 'notebook.json'),
            'utf-8'
          )
        )
      )
    ).toString('base64');

    await client.mutate({
      mutation: ctx.gql`
        mutation ImportNotebook($workspaceId: ID!, $source: String!) {
          importPad(workspaceId: $workspaceId, source: $source) {
            id
          }
        }
      `,
      variables: {
        workspaceId: workspace.id,
        source,
      },
    });
  });

  it('works for the user', async () => {
    const fetch = ctx.http.withAuth(userAuth.token);
    const doc = (await (await fetch(`/n/Title%3A${pad.id}`)).text())
      .replace(/<script>window\.__SESSION__.*<\/script>/g, '')
      .replaceAll(/http:\/\/localhost:[\d]+/g, 'http://localhost:xxxx');
    const expected = readFileSync(
      join(__dirname, '__fixtures__', 'ssr-lambda.spec.snap.html'),
      'utf-8'
    );
    const maxDifferenceRatio = 0.01;
    const distanceRatio = distance(expected, doc) / expected.length;
    if (distanceRatio > maxDifferenceRatio) {
      // eslint-disable-next-line no-console
      console.error(
        `The distance from the snapshot in __fixtures__/ssr-lambda.spec.snap.html is too big: ${distanceRatio}. Please update the fixture or change this thresold.`
      );
    }
    expect(distanceRatio).toBeLessThanOrEqual(maxDifferenceRatio);
  });
});
