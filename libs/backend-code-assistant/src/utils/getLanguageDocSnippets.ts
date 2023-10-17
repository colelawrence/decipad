/* eslint-disable no-underscore-dangle */
import { LRUCache } from 'lru-cache';
import { searchStore } from '@decipad/backend-search';
import { getVectorEmbedding } from './getVectorEmbedding';
import { indexNames } from '../../../backend-search/src/config';

const snippetCache = new LRUCache<string, string[]>({ max: 500 });

export const getLanguageDocSnippets = async (
  prompt: string,
  max: number
): Promise<string[]> => {
  const cached = snippetCache.get(prompt);
  if (cached) {
    return cached;
  }
  const store = await searchStore();
  const vector = await getVectorEmbedding(prompt);
  const searchResults = await store.search({
    index: indexNames.languageDocs,
    body: {
      size: max,
      query: {
        knn: {
          embeddings_vector: {
            vector,
            k: max,
          },
        },
      },
      _source: ['chunk'],
    },
  });
  return searchResults.body.hits.hits.map(
    (hit: { _source: { chunk: string } }) => hit._source.chunk
  );
};
