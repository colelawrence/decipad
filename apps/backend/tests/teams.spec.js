'use strict';

/* eslint-env jest */

import test from './utils/test-with-sandbox';
import { withAuth, gql } from './utils/call-graphql';
import auth from './utils/auth';
import { withAuth as callSimpleWithAuth } from './utils/call-simple';

test('teams', () => {
  let newTeam;
  let inviteLink;

  it('team list starts empty', async () => {
    const client = withAuth(await auth());
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toHaveLength(0);
  }, 10000);

  it('can create a team', async () => {
    const client = withAuth(await auth());
    newTeam = (
      await client.mutate({
        mutation: gql`
          mutation {
            createTeam(team: { name: "Test Team 1" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createTeam;

    expect(newTeam.name).toBe('Test Team 1');
    expect(newTeam.id).toBeDefined();
  }, 10000);

  it('the team lists', async () => {
    const client = withAuth(await auth());
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toMatchObject([newTeam]);
  }, 10000);

  it('The creator is listed on the team users', async () => {
    const client = withAuth(await auth());
    const teamUsers = (
      await client.query({
        query: gql`
          query {
            teams {
              id
              name
              teamUsers {
                user {
                  id
                  name
                }
                permission
              }
            }
          }
        `,
      })
    ).data.teams[0].teamUsers;

    expect(teamUsers).toMatchObject([
      {
        user: {
          id: 'test user id 1',
          name: 'Test User',
        },
        permission: 'ADMIN',
      },
    ]);
  }, 10000);

  it('can invite other user to the team', async () => {
    const client = withAuth(await auth());
    inviteLink = (
      await client.mutate({
        mutation: gql`
          mutation {
            inviteUserToTeam(teamId: "${newTeam.id}", userId: "test user id 2", permission: READ)
          }
        `,
      })
    ).data.inviteUserToTeam;

    expect(inviteLink).toBeDefined();
  }, 10000);

  it('other user has no teams on their list', async () => {
    const client = withAuth(await auth('test user id 2'));
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toHaveLength(0);
  }, 10000);

  it('same user cannot accept invite', async () => {
    const call = callSimpleWithAuth(await auth('test user id 1'));
    await expect(call(inviteLink)).rejects.toThrow('Forbidden');
  }, 10000);

  it('other user can accept invite', async () => {
    const call = callSimpleWithAuth(await auth('test user id 2'));
    const response = await call(inviteLink);
  }, 10000);

  it('other user cannot re-accept invite', async () => {
    const call = callSimpleWithAuth(await auth('test user id 2'));
    await expect(call(inviteLink)).rejects.toThrow('Invite not found');
  }, 10000);

  it('the team lists on the other user team list', async () => {
    const client = withAuth(await auth('test user id 2'));
    const teams = (
      await client.query({
        query: gql`
          query {
            teams {
              id
              name
            }
          }
        `,
      })
    ).data.teams;
    expect(teams).toHaveLength(1);
    expect(teams[0]).toMatchObject(newTeam);
  }, 10000);

  it('can remove the other user from the team', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removeUserFromTeam(teamId: "${newTeam.id}", userId: "test user id 2")
        }
      `,
    });
  }, 10000);

  it('the team does not appear on the other user team list anymore', async () => {
    const client = withAuth(await auth('test user id 2'));
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toHaveLength(0);
  });

  it('can reinvite other user to the team', async () => {
    const client = withAuth(await auth());
    inviteLink = (
      await client.mutate({
        mutation: gql`
          mutation {
            inviteUserToTeam(teamId: "${newTeam.id}", userId: "test user id 2", permission: READ)
          }
        `,
      })
    ).data.inviteUserToTeam;

    expect(inviteLink).toBeDefined();
  }, 10000);

  it('other user can accept invite', async () => {
    const call = callSimpleWithAuth(await auth('test user id 2'));
    const response = await call(inviteLink);
  }, 10000);

  it('the team lists on the other user team list', async () => {
    const client = withAuth(await auth('test user id 2'));
    const teams = (
      await client.query({
        query: gql`
          query {
            teams {
              id
              name
            }
          }
        `,
      })
    ).data.teams;
    expect(teams).toHaveLength(1);
    expect(teams[0]).toMatchObject(newTeam);
  }, 10000);

  it('user can remove them-selves from team', async () => {
    const client = withAuth(await auth('test user id 2'));
    await client.mutate({
      mutation: gql`
        mutation {
          removeSelfFromTeam(teamId: "${newTeam.id}")
        }
      `,
    });
  }, 10000);

  it('the team does not appear on the other user team list anymore', async () => {
    const client = withAuth(await auth('test user id 2'));
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toHaveLength(0);
  }, 10000);

  it('sole admin cannot remove themselves from team', async () => {
    const client = withAuth(await auth());
    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            removeSelfFromTeam(teamId: "${newTeam.id}")
          }
        `,
      })
    ).rejects.toThrow('Cannot remove unique admin user');
  }, 10000);

  it('read-only user cannot remove team', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            removeTeam(teamId: "${newTeam.id}")
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  }, 10000);

  it('admin can remove team', async () => {
    const client = withAuth(await auth());
    await client.mutate({
      mutation: gql`
        mutation {
          removeTeam(teamId: "${newTeam.id}")
        }
      `,
    });
  }, 10000);

  it('the team does not list any more', async () => {
    const client = withAuth(await auth());
    expect(
      (
        await client.query({
          query: gql`
            query {
              teams {
                id
                name
              }
            }
          `,
        })
      ).data.teams
    ).toHaveLength(0);
  }, 10000);
});
