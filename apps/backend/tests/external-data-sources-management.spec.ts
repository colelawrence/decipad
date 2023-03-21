import { ExternalDataSource, Pad } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import getDefined from './utils/get-defined';

test('external data sources', (ctx) => {
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

  it('can be created', async () => {
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
              name
              provider
              externalId
              dataUrl
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    expect(newDataSource).toMatchObject({
      id: expect.stringMatching(/.+/),
      name: 'test data source 1',
      provider: 'gsheets',
      externalId: 'external id',
    });

    externalDataSource = newDataSource;
  });

  it('can be fetched', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    const dataSource = (
      await client.query({
        query: ctx.gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") {
              id
              name
              provider
              externalId
              dataUrl
            }
          }
        `,
      })
    ).data.getExternalDataSource;

    expect(dataSource).toMatchObject(externalDataSource!);
  });

  it('can be modified by owner', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    const dataSource = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            updateExternalDataSource(id: "${
              externalDataSource!.id
            }", dataSource: {
              name: "test data source 1 name modified"
            }) {
              id
              name
              provider
              externalId
              dataUrl
            }
          }
      `,
      })
    ).data.updateExternalDataSource;

    expect(dataSource).toMatchObject({
      ...externalDataSource,
      name: 'test data source 1 name modified',
    });

    externalDataSource = dataSource;
  });

  it('can be removed', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removeExternalDataSource(id: "${externalDataSource!.id}")
        }
      `,
    });

    await expect(
      client.query({
        query: ctx.gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") {
              id
              name
              provider
              externalId
              dataUrl
            }
          }
        `,
      })
    ).rejects.toThrow();
  });

  it('can be recreated', async () => {
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
              name
              provider
              externalId
              dataUrl
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    externalDataSource = newDataSource;
  });
});
