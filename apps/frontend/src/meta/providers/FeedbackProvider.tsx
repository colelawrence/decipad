import { ReactNode, useEffect } from 'react';

const hotjarSiteId = process.env.REACT_APP_HOTJAR_SITE_ID;
let hotjarInitialized = false;
const initializeHotjar = () => {
  // HOTJAR POLLUTION
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable no-underscore-dangle */
  if (!hotjarInitialized) {
    hotjarInitialized = true;
    if (!hotjarSiteId) {
      console.info('No hotjar site id, skipping feedback initialization');
      return;
    }
    (window as any)._hjSettings = {
      hjid: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
      hjsv: 6,
    };
    (window as any).hj = (...args: unknown[]) => {
      ((window as any).hj.q = (window as any).hj.q || []).push(args);
    };
    import(
      /* webpackIgnore: true */
      `https://static.hotjar.com/c/hotjar-${hotjarSiteId}.js?sv=6`
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  /* eslint-enable no-underscore-dangle */
};

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  useEffect(initializeHotjar, []);
  return <>{children}</>;
};
