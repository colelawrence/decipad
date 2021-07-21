import { AppProps } from 'next/app';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : <Component {...pageProps} />}
    </div>
  );
}

export default App;
