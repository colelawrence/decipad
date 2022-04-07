import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';

function App({ Component, pageProps }: AppProps): ReturnType<FC> {
  return (
    <>
      <Head>
        <title>Decipad - Make sense of numbers</title>
        <meta
          name="description"
          content="Decipad is a new way to create, collaborate and build anything you want using numbers. No code. No spreadsheets. No fuss."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@decipad" />
        <meta name="twitter:creator" content="@decipad" />
        <meta property="og:title" content="Decipad - Make sense of numbers" />
        <meta
          property="og:description"
          content="Decipad is a new way to create, collaborate and build anything you want using numbers. No code. No spreadsheets. No fuss."
        />
        <meta property="og:url" content="https://decipad.com" />
        <meta property="og:image" content="/assets/preview.png" />
        <meta property="og:image:alt" content="Decipad cover image" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Decipad" />
      </Head>
      <div suppressHydrationWarning style={{ height: '100%' }}>
        {typeof window === 'undefined' ? null : <Component {...pageProps} />}
      </div>
    </>
  );
}

export default App;
