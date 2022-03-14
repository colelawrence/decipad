import { ApolloClient, InMemoryCache } from '@apollo/client';
import { CREATE_EXTERNAL_DATA_SOURCE } from '@decipad/queries';
import { timeout } from '@decipad/utils';

interface CreateExternalDataSourceResult {
  externalDataSourceId: string;
  dataUrl: string;
  authUrl: string;
}

export async function createExternalDataSource({
  name,
  padId,
  provider,
  externalId,
}: {
  name: string;
  padId: string;
  provider: string;
  externalId: string;
}): Promise<CreateExternalDataSourceResult> {
  const client = getClient();
  const { data } = await client.mutate({
    mutation: CREATE_EXTERNAL_DATA_SOURCE,
    variables: {
      name,
      padId,
      provider,
      externalId,
    },
  });

  const { dataUrl, authUrl, id } = data.createExternalDataSource;
  return { dataUrl, authUrl, externalDataSourceId: id };
}

export async function authenticate(
  authUrl: string,
  returnPathname: string
): Promise<void> {
  await timeout(1000); // wait for doc to flush
  const redirectToUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
    returnPathname
  )}`;
  window.location.href = redirectToUrl;
}

function getClient() {
  return new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache(),
  });
}
