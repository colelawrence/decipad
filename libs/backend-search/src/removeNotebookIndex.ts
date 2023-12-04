import { searchStore } from './searchStore';
import { debug } from './debug';
import { indexNames } from './config';
import { errors } from '@opensearch-project/opensearch';

export const removeNotebookIndex = async (
  notebookId: string
): Promise<void> => {
  const store = await searchStore();

  try {
    await store.delete({ id: notebookId, index: indexNames.notebookTemplates });
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if (err.meta.statusCode === 404) {
        return;
      }
    }
    debug('Error removing notebook index %j', err);
    throw err;
  }
};
