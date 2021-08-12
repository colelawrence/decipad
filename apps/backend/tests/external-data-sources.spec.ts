import waitForExpect from 'wait-for-expect';
import { ExternalDataSource } from '@decipad/backendtypes';
import test from './sandbox';

test('external data sources', ({
  test: it,
  graphql: { withAuth },
  gql,
  auth,
}) => {
  let externalDataSource: ExternalDataSource | undefined;

  it('can be created', async () => {
    const client = withAuth(await auth());

    const newDataSource = (
      await client.mutate({
        mutation: gql`
          mutation {
            createExternalDataSource(
              dataSource: {
                name: "test data source 1"
                provider: other
                externalId: "external id"
              }
            ) {
              id
              name
              provider
              externalId
              dataPath
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    expect(newDataSource).toMatchObject({
      id: expect.stringMatching(/.+/),
      name: 'test data source 1',
      provider: 'other',
      externalId: 'external id',
    });

    externalDataSource = newDataSource;
  });

  it('can be fetched', async () => {
    const client = withAuth(await auth());

    const dataSource = (
      await client.query({
        query: gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") {
              id
              name
              provider
              externalId
              dataPath
            }
          }
        `,
      })
    ).data.getExternalDataSource;

    expect(dataSource).toMatchObject(externalDataSource!);
  });

  it('cannot be fetched by other user', async () => {
    const client = withAuth(await auth('test user id 2'));

    await expect(
      client.query({
        query: gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") { id }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('can be modified by owner', async () => {
    const client = withAuth(await auth());
    const dataSource = (
      await client.mutate({
        mutation: gql`
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
              dataPath
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
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
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
              dataPath
            }
          }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('can be removed', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removeExternalDataSource(id: "${externalDataSource!.id}")
        }
      `,
    });

    await expect(
      client.query({
        query: gql`
          query {
            getExternalDataSource(id: "${externalDataSource!.id}") {
              id
              name
              provider
              externalId
              dataPath
            }
          }
        `,
      })
    ).rejects.toThrow();

    // recreate
    const newDataSource = (
      await client.mutate({
        mutation: gql`
          mutation {
            createExternalDataSource(
              dataSource: {
                name: "test data source 1"
                provider: other
                externalId: "external id"
              }
            ) {
              id
              name
              provider
              externalId
              dataPath
            }
          }
        `,
      })
    ).data.createExternalDataSource;

    externalDataSource = newDataSource;
  });

  it('can be shared with another user', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          shareExternalDataSourceWithUser(
            id: "${externalDataSource!.id}"
            userId: "test user id 2"
            permissionType: READ
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = withAuth(await auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: gql`
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
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          unshareExternalDataSourceWithUser(
            id: "${externalDataSource!.id}"
            userId: "test user id 2"
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = withAuth(await auth('test user id 2'));
      await expect(
        client2.query({
          query: gql`
            query {
              getExternalDataSource(id: "${externalDataSource!.id}") { id }
            }
          `,
        })
      ).rejects.toThrow('Forbidden');
    });
  });

  it('can be shared with another role', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
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
      const client2 = withAuth(await auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: gql`
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
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          unshareExternalDataSourceWithRole(
            id: "${externalDataSource!.id}"
            roleId: "roleid1"
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = withAuth(await auth('test user id 2'));
      await expect(
        client2.query({
          query: gql`
            query {
              getExternalDataSource(id: "${externalDataSource!.id}") { id }
            }
          `,
        })
      ).rejects.toThrow('Forbidden');
    });
  });

  it('can be shared with another e-mail address', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          shareExternalDataSourceWithEmail(
            id: "${externalDataSource!.id}"
            email: "test2@decipad.com"
            permissionType: READ
          )
        }
      `,
    });

    await waitForExpect(async () => {
      const client2 = withAuth(await auth('test user id 2'));
      expect(
        (
          await client2.query({
            query: gql`
              query {
                getExternalDataSource(id: "${externalDataSource!.id}") { id }
              }
          `,
          })
        ).data.getExternalDataSource.id
      ).toBe(externalDataSource!.id);
    });
  });

  it('cannot be modified by user that has read-only access', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
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
              dataPath
            }
          }
      `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it.todo('can be left by self');
  it.todo('data can be fetched');
});
