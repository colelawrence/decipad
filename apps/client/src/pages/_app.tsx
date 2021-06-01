import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import { theme } from '@decipad/ui';
import { DeciRuntimeProvider, DeciRuntimeConsumer } from '@decipad/editor';

import { Loading } from '../components/Loading/Loading';
import { Login } from '../components/Login/Login';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Decipad</title>
      </Head>
      <Provider session={pageProps.session}>
        <ChakraProvider resetCSS theme={theme}>
          <DeciRuntimeProvider>
            <DeciRuntimeConsumer>
              {({ runtime, loading }) => {
                if (loading) {
                  return <Loading />;
                }
                if (runtime == null) {
                  return <Login />;
                }
                return <Component {...pageProps} />;
              }}
            </DeciRuntimeConsumer>
          </DeciRuntimeProvider>
        </ChakraProvider>
      </Provider>
    </>
  );
};

export default App;
