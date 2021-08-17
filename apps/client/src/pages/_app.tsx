import { AppProps } from 'next/app';
import { FC } from 'react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

function App({ Component, pageProps }: AppProps): ReturnType<FC> {
  return (
    <div suppressHydrationWarning style={{ height: '100%' }}>
      {typeof window === 'undefined' ? null : <Component {...pageProps} />}
    </div>
  );
}

export default App;
