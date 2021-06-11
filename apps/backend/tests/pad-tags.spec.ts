/* eslint-env jest */

import { ObservableSubscription } from '@apollo/client';
import waitForExpect from 'wait-for-expect';
import test from './utils/test-with-sandbox';
import { withAuth, gql } from './utils/call-graphql';
import { withAuth as callWithAuth } from './utils/call-simple';
import auth from './utils/auth';
import { timeout } from './utils/timeout';
import createWebsocketLink from './utils/graphql-websocket-link';
import createDeciWebsocket from './utils/websocket';

waitForExpect.defaults.timeout = 14000;
waitForExpect.defaults.interval = 500;

test('pads', () => {
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
    const link = `http://localhost:3333/api/invites/${invitationIds}/accept`;
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
  }, 10000);

  it('guest subscribes to tag changes', async () => {
    await subscribe('test user id 2', workspace.id, guestTags, subscriptions);
  }, 10000);

  it('other user has no tags yet', async () => {
    const client = withAuth(await auth('test user id 2'));
    await waitForExpect(async () => {
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toHaveLength(0);
    });
  }, 15000);

  it('other user has no tags yet from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(0);
    });
  }, 15000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toMatchObject(['tag one']);
    });
  }, 15000);

  it('admin has a tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(1);
      expect(adminTags[0]).toBe('tag one');
    });
  }, 15000);

  it('other user has a tag', async () => {
    const client = withAuth(await auth('test user id 2'));
    const tags = (
      await client.query({
        query: gql`
        query {
          tags(workspaceId: "${workspace.id}")
        }
      `,
      })
    ).data.tags;
    expect(tags).toMatchObject(['tag one']);
  });

  it('other user has a tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags[0]).toBe('tag one');
    });
  }, 15000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toMatchObject(['tag one', 'tag two']);
    });
  }, 15000);

  it('other user has a tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(2);
      expect(guestTags).toMatchObject(['tag one', 'tag two']);
    });
  }, 15000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toMatchObject(['tag two']);
    });
  }, 15000);

  it('other user no longer has the removed tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags).toMatchObject(['tag two']);
    });
  }, 15000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toHaveLength(0);
    });
  }, 15000);

  it('other user no longer has the tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(0);
    });
  }, 15000);

  it('admin has the tag', async () => {
    const client = withAuth(await auth());
    const tags = (
      await client.query({
        query: gql`
        query {
          tags(workspaceId: "${workspace.id}")
        }
      `,
      })
    ).data.tags;
    expect(tags).toMatchObject(['tag two']);
  });

  it('admin has the tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(1);
      expect(adminTags).toMatchObject(['tag two']);
    });
  }, 15000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toMatchObject(['tag two']);
    });
  }, 15000);

  it('other user has tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(guestTags).toHaveLength(1);
      expect(guestTags).toMatchObject(['tag two']);
    }, 20000);
  }, 21000);

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
      const tags = (
        await client.query({
          query: gql`
          query {
            tags(workspaceId: "${workspace.id}")
          }
        `,
        })
      ).data.tags;
      expect(tags).toHaveLength(0);
    });
  }, 15000);

  it('admin user no longer has tag from subscription', async () => {
    await waitForExpect(async () => {
      expect(adminTags).toHaveLength(0);
    });
  }, 15000);

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
});

async function createClient(userId: string) {
  const { token } = await auth(userId);
  const link = createWebsocketLink(createDeciWebsocket(token), 120000);
  return withAuth({ token, link });
}

async function subscribe(
  userId: string,
  workspaceId: string,
  tags: string[],
  subscriptions: ObservableSubscription[]
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

  subscriptions.push(
    await sub.subscribe({
      error(err) {
        throw err;
      },
      complete() {
        console.error('COMPLETE!');
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

  await timeout(2000);
}
