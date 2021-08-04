/* eslint-env jest */

import waitForExpect from 'wait-for-expect';
import { Workspace, Role } from '@decipad/backendtypes';
import test from './sandbox';
import { create as createResourcePermission } from './utils/permissions';

waitForExpect.defaults.timeout = 10000;
waitForExpect.defaults.interval = 500;

test('share with role', ({ test: it, graphql: { withAuth }, gql, auth }) => {
  let workspace: Workspace;
  let role: Role;

  beforeAll(async () => {
    // create a permission to a resource to share
    await createResourcePermission({
      userId: 'test user id 1',
      givenByUserId: 'test user id 1',
      resourceType: 'testtype',
      resourceId: 'testresourceid1',
      type: 'ADMIN',
    });

    const client = withAuth(await auth());
    workspace = (
      await client.mutate({
        mutation: gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createWorkspace;

    role = (
      await client.mutate({
        mutation: gql`
          mutation {
            createRole(role: {
              name: "read-only role"
              workspaceId: "${workspace.id}"
            }) {
                id
                name
              }
          }
      `,
      })
    ).data.createRole;

    // add user to role without invite etc.
    await createResourcePermission({
      userId: 'test user id 2',
      roleId: role.id,
      givenByUserId: 'test user id 1',
      resourceType: 'roles',
      resourceId: role.id,
      type: 'READ',
      canComment: true,
    });
  });

  it('forbids non-admin to share with role', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
          mutation ($roleId: ID!) {
            shareWithRole(
              resource: "/testtype/testresourceid1"
              roleId: $roleId
              permissionType: READ
              canComment: true
            )
          }
        `,
        variables: {
          roleId: role.id,
        },
      })
    ).rejects.toThrow('Forbidden');
  });

  it('allows admin to share with role', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation ($roleId: ID!) {
          shareWithRole(
            resource: "/testtype/testresourceid1"
            roleId: $roleId
            permissionType: READ
            canComment: true
          )
        }
      `,
      variables: {
        roleId: role.id,
      },
    });
  });

  it('admin can list role in resource', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth());
      const sharedWith = (
        await client.query({
          query: gql`
            query {
              resourceSharedWith(resource: "/testtype/testresourceid1") {
                roles {
                  role {
                    id
                    name
                    workspace {
                      id
                      name
                    }
                    users {
                      id
                    }
                  }
                  permissionType
                  canComment
                }
              }
            }
          `,
        })
      ).data.resourceSharedWith;

      expect(sharedWith).toMatchObject({
        roles: [
          {
            role: {
              id: role.id,
              name: role.name,
              workspace: {
                id: workspace.id,
                name: workspace.name,
              },
              users: [
                {
                  id: 'test user id 2',
                },
              ],
            },
          },
        ],
      });
    });
  }, 15000);

  it('target user has access to resource', async () => {
    const client = withAuth(await auth('test user id 2'));
    const resourcesPage = (
      await client.query({
        query: gql`
          query {
            resourcesSharedWithMe(
              page: { maxItems: 10 }
              resourceType: "testtype"
            ) {
              items {
                ... on SharedResource {
                  resource
                  permission
                  canComment
                }
              }
              count
              hasNextPage
              cursor
            }
          }
        `,
      })
    ).data.resourcesSharedWithMe;

    expect(resourcesPage).toMatchObject({
      items: [
        {
          resource: '/testtype/testresourceid1',
          permission: 'READ',
          canComment: true,
        },
      ],
      count: 1,
      hasNextPage: false,
      cursor: null,
    });
  });

  it('does not allow non-admin to unshare with role', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
          mutation ($roleId: ID!) {
            unShareWithRole(
              resource: "/testtype/testresourceid1"
              roleId: $roleId
            )
          }
        `,
        variables: {
          roleId: role.id,
        },
      })
    ).rejects.toThrow('Forbidden');
  });

  it('allows admin to unshare with role', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation ($roleId: ID!) {
          unShareWithRole(
            resource: "/testtype/testresourceid1"
            roleId: $roleId
          )
        }
      `,
      variables: {
        roleId: role.id,
      },
    });
  });

  it('target user no longer has access to resource', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const resourcesPage = (
        await client.query({
          query: gql`
            query {
              resourcesSharedWithMe(
                page: { maxItems: 10 }
                resourceType: "testtype"
              ) {
                items {
                  ... on SharedResource {
                    resource
                    permission
                    canComment
                  }
                }
                count
                hasNextPage
                cursor
              }
            }
          `,
        })
      ).data.resourcesSharedWithMe;

      expect(resourcesPage).toMatchObject({
        items: [],
        count: 0,
        hasNextPage: false,
        cursor: null,
      });
    });
  }, 15000);

  it('admin shares with role again', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation ($roleId: ID!) {
          shareWithRole(
            resource: "/testtype/testresourceid1"
            roleId: $roleId
            permissionType: READ
            canComment: true
          )
        }
      `,
      variables: {
        roleId: role.id,
      },
    });
  });

  it('target user leaves role', async () => {
    const client = withAuth(await auth('test user id 2'));

    await client.mutate({
      mutation: gql`
        mutation ($roleId: ID!) {
          removeSelfFromRole(roleId: $roleId)
        }
      `,
      variables: {
        roleId: role.id,
      },
    });
  });

  it('target user no longer has access to resource', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const resourcesPage = (
        await client.query({
          query: gql`
            query {
              resourcesSharedWithMe(
                page: { maxItems: 10 }
                resourceType: "testtype"
              ) {
                items {
                  ... on SharedResource {
                    resource
                    permission
                    canComment
                  }
                }
                count
                hasNextPage
                cursor
              }
            }
          `,
        })
      ).data.resourcesSharedWithMe;

      expect(resourcesPage).toMatchObject({
        items: [],
        count: 0,
        hasNextPage: false,
        cursor: null,
      });
    });
  }, 15000);

  it('user gets back into role', async () => {
    // add user to role without invite etc.
    await createResourcePermission({
      userId: 'test user id 2',
      roleId: role.id,
      givenByUserId: 'test user id 1',
      resourceType: 'roles',
      resourceId: role.id,
      type: 'READ',
      canComment: true,
    });
  });

  it('target user has access to resource again', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const resourcesPage = (
        await client.query({
          query: gql`
            query {
              resourcesSharedWithMe(
                page: { maxItems: 10 }
                resourceType: "testtype"
              ) {
                items {
                  ... on SharedResource {
                    resource
                    permission
                    canComment
                  }
                }
                count
                hasNextPage
                cursor
              }
            }
          `,
        })
      ).data.resourcesSharedWithMe;

      expect(resourcesPage).toMatchObject({
        items: [
          {
            resource: '/testtype/testresourceid1',
            permission: 'READ',
            canComment: true,
          },
        ],
        count: 1,
        hasNextPage: false,
        cursor: null,
      });
    });
  }, 15000);
});
