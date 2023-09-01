/* eslint-env jest */

// existing tests very granular
/* eslint-disable jest/expect-expect */

import { Workspace } from '@decipad/backendtypes';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { queryCountHandler } from '@decipad/lambdas';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { noop } from '@decipad/utils';

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
    const mockedEvent: APIGatewayProxyEventV2 = {
      version: '2.0',
      routeKey: 'GET /endpoint',
      rawPath: '/endpoint',
      rawQueryString: '',
      headers: {},
      requestContext: {
        accountId: '',
        apiId: '',
        domainName: '',
        domainPrefix: '',
        http: {
          method: 'GET',
          path: '/endpoint',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'Mock User Agent',
        },
        requestId: '',
        routeKey: '',
        stage: 'test',
        time: '',
        timeEpoch: 0,
      },
      isBase64Encoded: false,
    };

    const context: Context = {
      ...ctx,
      functionName: '',
      functionVersion: '',
      awsRequestId: '',
      memoryLimitInMB: '2048MB',
      logStreamName: '',
      getRemainingTimeInMillis: () => 1000,
      logGroupName: '',
      callbackWaitsForEmptyEventLoop: false,
      invokedFunctionArn: '',
      done: noop,
      succeed: noop,
      fail: noop,
    };
    const client = ctx.graphql.withAuth(await ctx.auth());

    await queryCountHandler(mockedEvent, context, noop);

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
