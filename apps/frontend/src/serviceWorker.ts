import domLoaded from 'dom-loaded';
import { registerRoute } from 'workbox-routing';

if ('serviceWorker' in navigator) {
  (async () => {
    await domLoaded;
    // eslint-disable-next-line no-console
    console.debug('registering service worker...');
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      if (process.env.NODE_ENV === 'production') {
        registerRoute(/\.map$/, () =>
          Promise.resolve(
            new Response('Not Found', {
              status: 404,
              statusText: 'Not Found',
            })
          )
        );
      }
    } catch (err) {
      console.error('error registering service worker:', err);
    }
  })();
}
