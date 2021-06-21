import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { RuntimeProvider } from '@decipad/editor';
import { theme } from '@decipad/ui';
import { useSession, Provider as AuthProvider } from 'next-auth/client';
import { BrowserRouter } from 'react-router-dom';
import Head from 'next/head';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useApollo } from '../lib/apolloClient';
import { Router } from '../components/Router';

export default function Index({ pageProps = {} }) {
  const apolloClient = useApollo(pageProps);
  const [session, loading] = useSession();

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  return (
    <div>
      <Head>
        <title>Decipad</title>
      </Head>
      <AuthProvider session={session!}>
        <ApolloProvider client={apolloClient}>
          <ChakraProvider resetCSS theme={theme}>
            <RuntimeProvider>
              <BrowserRouter>
                <Router session={session} />
              </BrowserRouter>
            </RuntimeProvider>
          </ChakraProvider>
        </ApolloProvider>
      </AuthProvider>
    </div>
  );
}
