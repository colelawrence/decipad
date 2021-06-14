import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { RuntimeProvider } from '@decipad/editor';
import { theme } from '@decipad/ui';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { useApollo } from '../lib/apolloClient';

const App = ({ Component, pageProps }: AppProps) => {
  const apolloClient = useApollo(pageProps);
  return (
    <>
      <Head>
        <title>Decipad</title>
      </Head>
      <Provider session={pageProps.session}>
        <ApolloProvider client={apolloClient}>
          <ChakraProvider resetCSS theme={theme}>
            <RuntimeProvider>
              <Component {...pageProps} />
            </RuntimeProvider>
          </ChakraProvider>
        </ApolloProvider>
      </Provider>
    </>
  );
};

export default App;
