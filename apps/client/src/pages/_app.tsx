import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { theme } from '../theme';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Decipad</title>
      </Head>
      <Provider session={pageProps.session}>
        <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </Provider>
    </>
  );
};

export default App;
