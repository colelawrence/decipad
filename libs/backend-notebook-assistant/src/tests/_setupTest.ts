import stringify from 'json-stringify-safe';
import { TestContext } from '@decipad/backend-test-sandbox';
import defaultDocument from './__fixtures__/simplest.json';
import { noop } from '@decipad/utils';
import { Document } from '@decipad/editor-types';

interface AfterRunResults {
  notebookId: string;
}

type AfterRunCallback = (results: AfterRunResults) => void;

export const setupTest = (
  ctx: TestContext,
  document: Document = defaultDocument as Document,
  afterRun: AfterRunCallback = noop
) => {
  beforeAll(async () => {
    const gqlService = ctx.graphql.withAuth(await ctx.auth());
    const workspace = (
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

    const source = Buffer.from(stringify(document), 'utf-8').toString('base64');

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

    afterRun({ notebookId: newNotebookId });
  }, 120000);
};
