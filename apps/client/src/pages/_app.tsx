import { ChakraProvider } from '@chakra-ui/react';
import { DeciRuntimeProvider } from '@decipad/editor';
import { theme } from '@decipad/ui';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Decipad</title>
      </Head>
      <Provider session={pageProps.session}>
        <ChakraProvider resetCSS theme={theme}>
          <DeciRuntimeProvider>
            <Component {...pageProps} />
          </DeciRuntimeProvider>
        </ChakraProvider>
      </Provider>
    </>
  );
};

export default App;
