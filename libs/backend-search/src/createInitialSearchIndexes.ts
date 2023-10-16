import { Client } from '@opensearch-project/opensearch';
import { indexNames } from './config';

const creatingIndex = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch (err) {
    if (!(err as Error).message.toLowerCase().includes('already exists')) {
      throw err;
    }
  }
};

export const createInitialSearchIndexes = async (
  store: Client
): Promise<void> => {
  await creatingIndex(() =>
    store.indices.create({
      index: indexNames.notebookTemplates,
      body: {
        settings: {
          index: {
            knn: true,
          },
        },
        mappings: {
          properties: {
            embeddings_vector: {
              type: 'knn_vector',
              dimension: 1536,
              method: {
                name: 'hnsw',
                space_type: 'l2',
                engine: 'faiss',
                parameters: {
                  ef_construction: 128,
                  m: 24,
                },
              },
            },
          },
        },
      },
    })
  );

  await creatingIndex(() =>
    store.indices.create({
      index: indexNames.languageDocs,
      body: {
        settings: {
          index: {
            knn: true,
          },
        },
        mappings: {
          properties: {
            embeddings_vector: {
              type: 'knn_vector',
              dimension: 1536,
              method: {
                name: 'hnsw',
                space_type: 'l2',
                engine: 'faiss',
                parameters: {
                  ef_construction: 128,
                  m: 24,
                },
              },
            },
            chunk: {
              type: 'text',
              index: false,
            },
          },
        },
      },
    })
  );
};
