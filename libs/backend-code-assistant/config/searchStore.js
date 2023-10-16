const { search } = require('@nasa-gcn/architect-functions-search');
const { createInitialSearchIndexes } = require('./createinitialSearchIndexes');

let createdInitialIndexes = false;

exports.searchStore = async () => {
  const client = await search();
  if (!createdInitialIndexes) {
    await createInitialSearchIndexes(client);
    createdInitialIndexes = true;
  }

  return client;
};
