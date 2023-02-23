import domLoaded from 'dom-loaded';

if ('serviceWorker' in navigator) {
  (async () => {
    await domLoaded;
    // eslint-disable-next-line no-console
    console.log('registering service worker...');
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (err) {
      console.error('error registering service worker:', err);
    }
  })();
}
