import { AppProps } from 'next/app';
import { FC } from 'react';

function App({ Component, pageProps }: AppProps): ReturnType<FC> {
  return (
    <div suppressHydrationWarning style={{ height: '100%' }}>
      {typeof window === 'undefined' ? null : <Component {...pageProps} />}
    </div>
  );
}

export default App;
