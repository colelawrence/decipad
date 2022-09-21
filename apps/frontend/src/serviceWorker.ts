import domLoaded from 'dom-loaded';

export const serviceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    await domLoaded;
    // eslint-disable-next-line no-console
    console.log('registering service worker...');
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (err) {
      console.error('error registering service worker:', err);
    }
  }
};
