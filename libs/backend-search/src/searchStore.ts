import { search } from '@nasa-gcn/architect-functions-search';
import { Client } from '@opensearch-project/opensearch';
import { debug } from './debug';
import { createInitialSearchIndexes } from './createInitialSearchIndexes';
import { once } from '@decipad/utils';

let createdInitialIndexes = false;

export const isLocalDev = once(() => {
  const url = process.env.DECI_APP_URL_BASE;
  return (
    url == null ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1')
  );
});

const createClient = async (): Promise<Client> => {
  if (isLocalDev()) {
    process.env.DECI_SEARCH_URL =
      'https://search-opensearch-domain-localdev-shmnireftiecwmqssktzxttgji.eu-west-2.es.amazonaws.com';

    process.env.DECI_SEARCH_USERNAME = 'decipaddev';
    process.env.DECI_SEARCH_PASSWORD = 'dfsdfjd$@#$wD22x';
  }
  return (await search()) as Client;
};

export const searchStore = async (): Promise<Client> => {
  const client = await createClient();
  try {
    if (!createdInitialIndexes) {
      await createInitialSearchIndexes(client);
      createdInitialIndexes = true;
    }
  } catch (err) {
    if (!(err as Error).message.toLowerCase().includes('already exists')) {
      debug('Error caught while creating an index', err);
      throw err;
    } else {
      createdInitialIndexes = true;
    }
  }

  return client;
};
