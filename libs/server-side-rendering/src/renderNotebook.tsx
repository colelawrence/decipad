/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import {
  createClient,
  cacheExchange,
  fetchExchange,
  ssrExchange as createSsrExchange,
} from 'urql';
import { renderToPipeableStream } from 'react-dom/server';
import createCache from '@emotion/cache';
import { Session } from 'next-auth';
import { App } from './App';
import { renderApp, RenderDependencies } from './renderApp';
import { authCookieHeader } from './utils/authCookieHeader';
import documentTemplate from '../public/index.html';

interface GetDependenciesProps {
  jsEntryPoint: string;
  urlBase: string;
  location: string;
  cookies: string[];
  session: Session;
}

const getDependencies = async ({
  jsEntryPoint,
  urlBase,
  location,
  cookies,
  session,
}: GetDependenciesProps): Promise<RenderDependencies> => {
  // graphql
  const ssrExchange = createSsrExchange({ isClient: false });
  const authHeaders = authCookieHeader(cookies ?? []);
  const client = createClient({
    url: `${urlBase}/graphql`,
    fetchOptions: {
      credentials: 'include',
      headers: authHeaders,
    },
    suspense: true, // This activates urql's Suspense mode on the server-side
    exchanges: [cacheExchange, ssrExchange, fetchExchange],
  });

  // css
  const emotionCache = createCache({ key: 'deci' });

  return {
    jsEntryPoint,
    urlBase,
    session,
    getElement: () => (
      <App
        location={location}
        client={client}
        urlBase={urlBase}
        emotionCache={emotionCache}
        session={session}
      />
    ),
    documentTemplate,
    renderToPipeableStream,
    extractData: () => ssrExchange.extractData(),
    emotionCache,
  };
};

export interface RenderNotebookProps {
  jsEntryPoint: string;
  baseUrl: string;
  notebookId: string;
  cookies: string[];
  session: Session;
}

export const renderNotebook = async ({
  jsEntryPoint,
  baseUrl,
  notebookId,
  cookies,
  session,
}: RenderNotebookProps): Promise<string> => {
  const path = `/n/${notebookId}`;

  // await createDOM({ location, document: documentTemplate });

  const dependencies = await getDependencies({
    jsEntryPoint,
    urlBase: baseUrl,
    location: path,
    cookies,
    session,
  });

  return renderApp(dependencies);
};
