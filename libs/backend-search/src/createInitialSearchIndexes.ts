import { Client } from '@opensearch-project/opensearch';
import { indexNames } from './config';

export const createInitialSearchIndexes = async (
  store: Client
): Promise<void> => {
  await store.indices.create({
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
  });
};
