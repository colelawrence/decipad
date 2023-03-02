import waitForExpect from 'wait-for-expect';
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
                provider: testdatasource
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
      provider: 'testdatasource',
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

  it('cannot be fetched by other user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    await expect(
      client.query({
        query: ctx.gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") { id }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
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

  it('cannot be modified by other user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
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
    ).rejects.toThrow('Forbidden');
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

    // recreate
    const newDataSource = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createExternalDataSource(
              dataSource: {
                padId: "${getDefined(pad).id}"
                name: "test data source 1"
                provider: testdatasource
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

  it('can be shared with another user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          shareExternalDataSourceWithUser(
            id: "${externalDataSource!.id}"
            userId: "test user id 2"
            permissionType: READ
          ) { id }
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: ctx.gql`
              query {
                getExternalDataSource(id: "${externalDataSource!.id}") { id }
              }
          `,
          })
        ).data.getExternalDataSource.id
      ).toBe(externalDataSource!.id);
    });
  });

  it('can be unshared with another user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unshareExternalDataSourceWithUser(
            id: "${externalDataSource!.id}"
            userId: "test user id 2"
          ) { id }
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      await expect(
        client2.query({
          query: ctx.gql`
            query {
              getExternalDataSource(id: "${externalDataSource!.id}") { id }
            }
          `,
        })
      ).rejects.toThrow('Forbidden');
    });
  });

  it.skip('can be shared with another role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          shareExternalDataSourceWithRole(
            id: "${externalDataSource!.id}"
            roleId: "roleid1"
            permissionType: READ
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: ctx.gql`
              query {
                getExternalDataSource(id: "${externalDataSource!.id}") { id }
              }
          `,
          })
        ).data.getExternalDataSource.id
      ).toBe(externalDataSource!.id);
    });
  });

  it('can be unshared with role', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          unshareExternalDataSourceWithRole(
            id: "${externalDataSource!.id}"
            roleId: "roleid1"
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      await expect(
        client2.query({
          query: ctx.gql`
            query {
              getExternalDataSource(id: "${externalDataSource!.id}") { id }
            }
          `,
        })
      ).rejects.toThrow('Forbidden');
    });
  });

  it('can be shared with another e-mail address', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          shareExternalDataSourceWithEmail(
            id: "${externalDataSource!.id}"
            email: "test2@decipad.com"
            permissionType: READ
          ) {
            id
          }
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: ctx.gql`
              query {
                getExternalDataSource(id: "${externalDataSource!.id}") { id }
              }
          `,
          })
        ).data.getExternalDataSource.id
      ).toBe(externalDataSource!.id);
    });
  });

  it.skip('cannot be modified by user that has read-only access', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
    await expect(
      client.mutate({
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
    ).rejects.toThrow('Forbidden');
  });

  it.todo('can be left by self');
  it.todo('data can be fetched');
});
