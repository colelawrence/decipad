/* eslint-disable no-console */
const { indexNames } = require('./indexNames');

const indexes = ['language-docs-vector'];

const removeAllLocalSearchIndexes = async (store) => {
  for (const indexName of indexes) {
    try {
      console.log('DELETING INDEX', indexName);
      // eslint-disable-next-line no-await-in-loop
      await store.indices.delete({
        index: indexName,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error removing index${indexName}:`, err);
      // throw err;
    }
  }
};

const creatingIndex = async (fn) => {
  try {
    await fn();
  } catch (err) {
    if (!err.message.toLowerCase().includes('already exists')) {
      throw err;
    }
  }
};

exports.createInitialSearchIndexes = async (store) => {
  if (process.env.DECI_REMOVE_SEARCH_INDEXES) {
    await removeAllLocalSearchIndexes(store);
  }

  await creatingIndex(() =>
    store.indices.create({
      index: indexNames.languageDocsVector,
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

  console.log(`ensured index ${indexNames.languageDocsVector}`);
};
