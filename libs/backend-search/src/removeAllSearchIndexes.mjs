import { Client } from '@opensearch-project/opensearch';

const indexes = ['notebook-templates'];

export const removeAllLocalSearchIndexes = async ({ port = 9200 } = {}) => {
  const store = new Client({
    node: `http://localhost:${port}`,
  });
  for (const indexName of indexes) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await store.indices.delete({
        index: indexName,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error removing index${indexName}:`, err);
    }
  }
};
