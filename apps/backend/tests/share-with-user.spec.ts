/* eslint-env jest */

import test from './utils/test-with-sandbox';
import { withAuth, gql } from './utils/call-graphql';
import auth from './utils/auth';
import { timeout } from './utils/timeout';
import createResourcePermission from '../lib/resource-permissions/create';

test('share with user', () => {
  beforeAll(async () => {
    // create a permission to a resource to share
    await createResourcePermission({
      userId: 'test user id 1',
      givenByUserId: 'test user id 1',
      resourceType: 'testtype',
      resourceId: 'testresourceid1',
      type: 'ADMIN',
    });
  });

  it('forbids non-admin to share with user', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            shareWithUser(
              resource: "/testtype/testresourceid1"
              userId: "test user id 2"
              permissionType: READ
              canComment: true
            )
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('allows admin to share with other user', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          shareWithUser(
            resource: "/testtype/testresourceid1"
            userId: "test user id 2"
            permissionType: READ
            canComment: true
          )
        }
      `,
    });
  });

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

  it('target user appears in resource shared with', async () => {
    const client = withAuth(await auth());
    const sharedWith = (
      await client.query({
        query: gql`
          query {
            resourceSharedWith(resource: "/testtype/testresourceid1") {
              users {
                user {
                  id
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
      users: [
        {
          user: {
            id: 'test user id 2',
          },
          permissionType: 'READ',
          canComment: true,
        },
      ],
    });
  });

  it('allows admin to unshare with user', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          unShareWithUser(
            resource: "/testtype/testresourceid1"
            userId: "test user id 2"
          )
        }
      `,
    });
  });

  it('waits a bit', async () => await timeout(1000));

  it('target user no longer has access to resource', async () => {
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
});
