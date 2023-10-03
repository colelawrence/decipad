/* eslint-disable jest/no-standalone-expect */
import { testWithSandbox as test } from '../../backend-test-sandbox/src';
import { searchTemplates } from './searchTemplates';
import template from './__fixtures__/candle-business.json';
import stringify from 'json-stringify-safe';

test('searchTemplates', async (ctx) => {
  let workspace;
  beforeAll(async () => {
    const gqlService = ctx.graphql.withAuth(
      await ctx.auth('test user id superadmin 1')
    );
    workspace = (
      await gqlService.mutate({
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

    const source = Buffer.from(stringify(template), 'utf-8').toString('base64');

    const newNotebookId = (
      await gqlService.mutate({
        mutation: ctx.gql`
          mutation {
            importPad(workspaceId: "${workspace!.id}", source: "${source}") {
              id
            }
          }
        `,
      })
    ).data?.importPad.id;

    await gqlService.mutate({
      mutation: ctx.gql`
        mutation {
          updatePad(id: "${newNotebookId}", pad: { isTemplate: 1 }) {
            id
          }
        }
      `,
    });

    await gqlService.mutate({
      mutation: ctx.gql`
        mutation {
          createOrUpdateSnapshot(notebookId: "${newNotebookId}", snapshotName: "Published 1", forceSearchIndexUpdate: true)
        }
      `,
    });
  }, 120000);

  it('searches', async () => {
    const results = await searchTemplates('candle factory business model');
    expect(results).toMatchObject([
      {
        isTemplate: 1,
        name: 'Imported notebook',
      },
    ]);
  }, 120000);
});
