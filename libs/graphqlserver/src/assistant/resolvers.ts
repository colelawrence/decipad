import { GraphqlContext, ID } from '@decipad/backendtypes';
import { resource } from '@decipad/backend-resources';
import { notebookAssistant } from '@decipad/backend-notebook-assistant';

const notebooks = resource('notebook');

const resolvers = {
  Query: {
    async suggestNotebookChanges(
      _: unknown,
      { notebookId, prompt }: { notebookId: ID; prompt: string },
      context: GraphqlContext
    ) {
      await notebooks.expectAuthorizedForGraphql({
        context,
        recordId: notebookId,
        minimumPermissionType: 'WRITE',
      });
      return notebookAssistant(notebookId, prompt);
    },
  },
};

export default resolvers;
