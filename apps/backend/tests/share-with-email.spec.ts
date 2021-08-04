/* eslint-env jest */

import arc from '@architect/functions';
import test from './sandbox';
import { create as createResourcePermission } from './utils/permissions';

test('share with email', ({
  test: it,
  graphql: { withAuth },
  gql,
  http: { withAuth: callWithAuth },
  auth,
}) => {
  let targetUserId: string;

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

  it('forbids non-admin to share with email', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            inviteToShareWithEmail(
              resource: "/testtype/testresourceid1"
              email: "email@decipad.com"
              permissionType: READ
              canComment: true
              resourceName: "Test resource"
            )
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('admin can share with existing email', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          inviteToShareWithEmail(
            resource: "/testtype/testresourceid1"
            email: "test2@decipad.com"
            permissionType: READ
            canComment: true
            resourceName: "Test resource"
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

  it('admin can share with non-existing email', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          inviteToShareWithEmail(
            resource: "/testtype/testresourceid1"
            email: "test3@decipad.com"
            permissionType: READ
            canComment: true
            resourceName: "Test resource"
          )
        }
      `,
    });
  });

  it('admin can list pending invitation', async () => {
    const client = withAuth(await auth());
    const sharedWith = (
      await client.query({
        query: gql`
          query {
            resourceSharedWith(resource: "/testtype/testresourceid1") {
              pendingInvitations {
                email
              }
            }
          }
        `,
      })
    ).data.resourceSharedWith;

    expect(sharedWith).toMatchObject({
      pendingInvitations: [
        {
          email: 'test3@decipad.com',
        },
      ],
    });
  });

  it('target user can accept invitation', async () => {
    const data = await arc.tables();

    const key = await data.userkeys.get({ id: `email:test3@decipad.com` });
    expect(key).toBeDefined();

    targetUserId = key.user_id;
    const invites = (
      await data.invites.query({
        IndexName: 'byUser',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': targetUserId,
        },
      })
    ).Items;

    expect(invites).toHaveLength(1);
    const invite = invites[0];
    const inviteAcceptLink = `/api/invites/${invite.id}/accept`;

    const call = callWithAuth((await auth(targetUserId)).token);
    await call(inviteAcceptLink);
  });

  it('admin can no longer list pending invitation', async () => {
    const client = withAuth(await auth());
    const sharedWith = (
      await client.query({
        query: gql`
          query {
            resourceSharedWith(resource: "/testtype/testresourceid1") {
              pendingInvitations {
                email
              }
            }
          }
        `,
      })
    ).data.resourceSharedWith;

    expect(sharedWith).toMatchObject({
      pendingInvitations: [],
    });
  });

  it('target user has access to resource', async () => {
    const client = withAuth(await auth(targetUserId));
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
});
