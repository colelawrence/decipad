import { PadRecord } from '@decipad/backendtypes';
import { searchStore } from './searchStore';
import { indexNames } from './config';
import { debug } from './debug';
import { createVectorEmbeddings } from './createVectorEmbedding';

export const indexNotebook = async (
  notebook: PadRecord,
  content: string,
  previousAttempts = 0
): Promise<void> => {
  debug('indexNotebook', { notebook, content, previousAttempts });
  const vector = await createVectorEmbeddings(content);
  const store = await searchStore();

  try {
    await store.index({
      id: notebook.id,
      index: indexNames.notebookTemplates,
      body: {
        embeddings_vector: vector,
      },
    });
  } catch (err) {
    debug('Error indexing document %j', err);
    throw err;
  }
};
