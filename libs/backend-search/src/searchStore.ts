import { Client } from '@opensearch-project/opensearch';
import { createInitialSearchIndexes } from './createInitialSearchIndexes';
import { searchStoreClient } from './searchStoreClient';

let createdInitialIndexes = false;

export const searchStore = async (): Promise<Client> => {
  const client = await searchStoreClient();
  if (!createdInitialIndexes) {
    await createInitialSearchIndexes(client);
    createdInitialIndexes = true;
  }

  return client;
};
