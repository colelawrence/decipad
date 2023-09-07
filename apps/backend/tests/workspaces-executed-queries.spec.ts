/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import { Workspace } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { queryCountHandler } from '@decipad/lambdas';
import { ScheduledEvent } from 'aws-lambda';

test('Executed queries', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let workspaceQueryCount;

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    workspace = (
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
  });

  it('can increment the query count for the first time', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
    workspaceQueryCount = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            incrementQueryCount(id: "${workspace.id}") {
              queryCount
              quotaLimit
            }
          }
        `,
      })
    ).data.incrementQueryCount;
    expect(workspaceQueryCount.queryCount).toBe(1);
    expect(workspaceQueryCount.quotaLimit).toBe(50);
  });

  it('can reset the query count when the scheduled job is executed', async () => {
    const mockedEvent: ScheduledEvent = {
      version: '0',
      account: '123456789012',
      region: 'eu-west-2',
      detail: {},
      'detail-type': 'Scheduled Event',
      source: 'aws.events',
      time: '2019-03-01T01:23:45Z',
      id: 'cdc73f9d-aea9-11e3-9d5a-835b769c0d9c',
      resources: [
        'arn:aws:events:eu-west-2:123456789012:rule/reset-querycount',
      ],
    };

    const client = ctx.graphql.withAuth(await ctx.auth());

    await queryCountHandler(mockedEvent);

    const { workspaces } = (
      await client.query({
        query: ctx.gql`
        fragment WorkspaceNotebook on Pad {
          id
          name
          icon
          status
          createdAt
          archived
          isPublic
          section {
            id
            name
          }
          myPermissionType
        }

        fragment WorkspaceSection on Section {
          id
          name
          color
          pads {
            ...WorkspaceNotebook
          }
          createdAt
        }

        fragment WorkspaceMembers on Workspace {
          access {
            users {
              permission
              user {
                id
                name
                email
                image
                emailValidatedAt
              }
            }
            roles {
              permission
              role {
                id
                users {
                  id
                  name
                  email
                  image
                  emailValidatedAt
                }
              }
            }
          }
        }

        fragment WorkspaceSubscriptionWithData on WorkspaceSubscription {
          paymentStatus
        }

        fragment WorkspaceExecutedQueryData on WorkspaceExecutedQuery {
          queryCount
          quotaLimit
        }

        fragment DashboardWorkspace on Workspace {
          id
          name
          isPremium
          pads(page: { maxItems: 10000 }) {
            items {
              ...WorkspaceNotebook
            }
          }
          workspaceSubscription {
            ...WorkspaceSubscriptionWithData
          }
          workspaceExecutedQuery {
            ...WorkspaceExecutedQueryData
          }
          membersCount
          sections {
            ...WorkspaceSection
          }
          ...WorkspaceMembers
        }

          query GetWorkspaces {
            workspaces {
              ...DashboardWorkspace
            }

            padsSharedWithMe(page: { maxItems: 10000 }) {
              items {
                ...WorkspaceNotebook
              }
            }
          }
        `,
      })
    ).data;

    const { workspaceExecutedQuery } = workspaces[0];

    expect(workspaceExecutedQuery.queryCount).toBe(0);
    expect(workspaceExecutedQuery.quotaLimit).toBe(50);
  });
});
