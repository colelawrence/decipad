/* eslint-env jest */

// existing sequential test "story" very granular
/* eslint-disable jest/expect-expect */

import { ObservableSubscription } from '@apollo/client';
import waitForExpect from 'wait-for-expect';
import { Workspace, Pad, Role, RoleInvitation } from '@decipad/backendtypes';
import test from './sandbox';
import { timeout } from './utils/timeout';

waitForExpect.defaults.interval = 250;

test('pad tags', ({
  test: it,
  subscriptionClient: createClient,
  graphql: { withAuth },
  gql,
  http: { withAuth: callWithAuth },
  auth,
}) => {
  let workspace: Workspace;
  let role: Role;
  let invitations: RoleInvitation[];
  let pad: Pad;
  const adminTags: string[] = [];
  const guestTags: string[] = [];
  const subscriptions: ObservableSubscription[] = [];

  beforeAll(async () => {
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

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  beforeAll(async () => {
    const client = withAuth(await auth());

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
                workspace {
                  id
                  name
                }
                users {
                  id
                  name
                }
              }
          }
      `,
      })
    ).data.createRole;

    expect(role).toMatchObject({
      name: 'read-only role',
      workspace: {
        id: workspace.id,
        name: 'Workspace 1',
      },
      users: [],
    });
  });

  beforeAll(async () => {
    const client = withAuth(await auth());

    invitations = (
      await client.mutate({
        mutation: gql`
          mutation {
            inviteUserToRole(userId: "test user id 2" roleId: "${role.id}" permission: READ) {
              id
            }
          }
        `,
      })
    ).data.inviteUserToRole;
  });

  beforeAll(async () => {
    const call = callWithAuth((await auth('test user id 2')).token);
    const invitationIds = invitations.map((i) => i.id).join(',');
    const link = `/api/invites/${invitationIds}/accept`;
    await call(link);
  });

  beforeAll(async () => {
    const client = withAuth(await auth());
    pad = (
      await client.mutate({
        mutation: gql`
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

  beforeAll(async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          sharePadWithRole(
            padId: "${pad.id}"
            roleId: "${role.id}"
            permissionType: READ
            canComment: true
          )
        }
      `,
    });
  });

  afterAll(() => {
    for (const sub of subscriptions) {
      sub.unsubscribe();
    }
  });

  it('admin subscribes to tag changes', async () => {
    await subscribe('test user id 1', workspace.id, adminTags, subscriptions);
  });

  it('guest subscribes to tag changes', async () => {
    await subscribe('test user id 2', workspace.id, guestTags, subscriptions);
  });

  it('other user has no tags yet', async () => {
    const client = withAuth(await auth('test user id 2'));
    await waitForExpect(async () => {
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toHaveLength(0);
    });
  });

  it('other user has no tags yet from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(0);
    });
  });

  it('the creator can add a tag to a pad', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          addTagToPad(padId: "${pad.id}", tag: "tag one")
        }
    `,
    });
  });

  it('admin has a tag', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth());
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toMatchObject(['tag one']);
    });
  });

  it('admin has a tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(1);
      expect(adminTags[0]).toBe('tag one');
    });
  });

  it('other user has a tag', async () => {
    const client = withAuth(await auth('test user id 2'));
    const { tags } = (
      await client.query({
        query: gql`
        query {
          tags(workspaceId: "${workspace.id}")
        }
      `,
      })
    ).data;
    expect(tags).toMatchObject(['tag one']);
  });

  it('other user has a tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags[0]).toBe('tag one');
    });
  });

  it('other user can list tag pads', async () => {
    const client = withAuth(await auth('test user id 2'));
    const padsPage = (
      await client.query({
        query: gql`
        query {
          padsByTag(workspaceId: "${workspace.id}", tag: "tag one", page: { maxItems: 10 }) {
            items { name tags }
            count
            hasNextPage
          }
        }
      `,
      })
    ).data.padsByTag;
    expect(padsPage.count).toBe(1);
    expect(padsPage.hasNextPage).toBe(false);
    const pads = padsPage.items;
    expect(pads).toMatchObject([{ name: 'Pad 1', tags: ['tag one'] }]);
  });

  it('admin adds a tag to the pad', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          addTagToPad(padId: "${pad.id}", tag: "tag two")
        }
    `,
    });
  });

  it('other user has the new tag also', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toMatchObject(['tag one', 'tag two']);
    });
  });

  it('other user has both tags from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(2);
      expect(guestTags).toMatchObject(['tag one', 'tag two']);
    });
  });

  it('admin removes tag from the pad', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          removeTagFromPad(padId: "${pad.id}", tag: "tag one")
        }
    `,
    });
  });

  it('other user no longer has the removed tag', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toMatchObject(['tag two']);
    });
  });

  it('other user no longer has the removed tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags).toMatchObject(['tag two']);
    });
  });

  it('other user can no longer list the pad under that tag', async () => {
    const client = withAuth(await auth('test user id 2'));
    const tags = (
      await client.query({
        query: gql`
        query {
          padsByTag(workspaceId: "${workspace.id}", tag: "tag one", page: { maxItems: 10 }) {
            items { name tags }
            count
          }
        }
      `,
      })
    ).data.padsByTag;

    expect(tags).toMatchObject({
      count: 0,
      items: [],
    });
  });

  it('admin unshares pad with role', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          unsharePadWithRole(
            padId: "${pad.id}"
            roleId: "${role.id}"
          )
        }
      `,
    });
  });

  it('other user no longer has the tag', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toHaveLength(0);
    });
  });

  it('other user no longer has the tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(0);
    });
  });

  it('admin has the tag', async () => {
    const client = withAuth(await auth());
    const { tags } = (
      await client.query({
        query: gql`
        query {
          tags(workspaceId: "${workspace.id}")
        }
      `,
      })
    ).data;
    expect(tags).toMatchObject(['tag two']);
  });

  it('admin has the tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(1);
      expect(adminTags).toMatchObject(['tag two']);
    });
  });

  it('admin gives user access to pad', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          sharePadWithUser(
            padId: "${pad.id}"
            userId: "test user id 2"
            permissionType: READ
            canComment: true
          )
        }
      `,
    });
  });

  it('other user has tag', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth('test user id 2'));
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toMatchObject(['tag two']);
    });
  });

  it('other user has tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags).toMatchObject(['tag two']);
    });
  });

  it('other user can list pad through tag', async () => {
    const client = withAuth(await auth('test user id 2'));
    const padsPage = (
      await client.query({
        query: gql`
        query {
          padsByTag(workspaceId: "${workspace.id}", tag: "tag two", page: { maxItems: 10 }) {
            items { name tags }
            count
            hasNextPage
          }
        }
      `,
      })
    ).data.padsByTag;
    expect(padsPage.count).toBe(1);
    expect(padsPage.hasNextPage).toBe(false);
    const pads = padsPage.items;
    expect(pads).toMatchObject([{ name: 'Pad 1', tags: ['tag two'] }]);
  });

  it('removes pad', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removePad(id: "${pad.id}")
        }
      `,
    });
  });

  it('admin user no longer has tag', async () => {
    await waitForExpect(async () => {
      const client = withAuth(await auth());
      const { tags } = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data;
      expect(tags).toHaveLength(0);
    });
  });

  it('admin user no longer has tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(0);
    });
  });

  it('admin can no longer list pad', async () => {
    const client = withAuth(await auth());
    const padsPage = (
      await client.query({
        query: gql`
        query {
          padsByTag(workspaceId: "${workspace.id}", tag: "tag two", page: { maxItems: 10 }) {
            items { name tags }
            count
            hasNextPage
          }
        }
      `,
      })
    ).data.padsByTag;
    expect(padsPage.count).toBe(0);
    expect(padsPage.items).toHaveLength(0);
  });

  async function subscribe(
    userId: string,
    workspaceId: string,
    tags: string[],
    pushToSubscriptions: ObservableSubscription[]
  ) {
    const client = await createClient(userId);
    const sub = client.subscribe({
      query: gql`
        subscription {
          tagsChanged(workspaceId: "${workspaceId}") {
            added { tag }
            removed { tag }
          }
        }
      `,
    });

    pushToSubscriptions.push(
      sub.subscribe({
        error(err) {
          throw err;
        },
        complete() {
          // do nothing
        },
        next({ data }) {
          const changes = data.tagsChanged;
          if (changes.added) {
            for (const w of changes.added) {
              tags.push(w.tag);
            }
          }

          if (changes.removed) {
            for (const tag of changes.removed) {
              const index = tags.indexOf(tag.tag);
              expect(index).toBeGreaterThan(-1);
              tags.splice(index, 1);
            }
          }
        },
      })
    );

    // We have to wait because a subscription does not
    // wait for the server to reply.
    // Which means that we do a setTimeout and hope
    // that the subscription was created before it expires.
    await timeout(8000);
  }
});
