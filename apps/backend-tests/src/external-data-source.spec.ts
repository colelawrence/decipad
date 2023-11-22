import { ExternalDataSource, Pad } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import getDefined from './utils/get-defined';

test('external data source', (ctx) => {
  const { test: it } = ctx;
  let pad: Pad | undefined;
  let externalDataSource: ExternalDataSource | undefined;

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

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

    expect(workspace).toMatchObject({ name: 'Workspace 1' });

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
            }
          }
        `,
      })
    ).data.createPad;
  });

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const newDataSource = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createExternalDataSource(
              dataSource: {
                padId: "${getDefined(pad).id}"
                name: "test data source 1"
                provider: gsheets
                externalId: "external id"
              }
            ) {
              id
              dataUrl
              authUrl
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    expect(newDataSource).toMatchObject({
      id: expect.stringMatching(/.+/),
      dataUrl: expect.stringMatching(/http:\/\/.+/),
      authUrl: expect.stringMatching(/http:\/\/.+/),
    });

    externalDataSource = newDataSource;
  });

  it('trying to fetch data from one with no keys results in authentication error', async () => {
    const fetchOptions = ctx.http.withAuthOptions((await ctx.auth()).token);
    const { dataUrl } = getDefined(externalDataSource);
    const response = await fetch(dataUrl, fetchOptions);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
    expect(await response.text()).toMatch(/needs authentication/i);
  });
});
