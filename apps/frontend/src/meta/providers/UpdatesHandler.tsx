import { useToast } from '@decipad/toast';
import { UpdatePrompt } from '@decipad/ui';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UpdatesContextProvider } from './UpdatesProvider';

const initialTimeoutMs = 1_000;
const checkForUpdatesIntervalMs = 60_000;

export const UpdatesHandler: FC<PropsWithChildren> = ({ children }) => {
  const toast = useToast();
  const [foundUpdate, setFoundUpdate] = useState(false);
  const onReload = useCallback(() => {
    console.warn('SW: reloading location');
    window.location.reload();
  }, []);
  const onUpdateFound = useCallback(() => {
    console.warn('SW: found update');
    setFoundUpdate(true);
  }, []);
  const reloading = useRef(false);

  useEffect(() => {
    if (foundUpdate && !reloading.current) {
      reloading.current = true;
      toast(<UpdatePrompt onReload={onReload} />, 'info', {
        autoDismiss: false,
      });
    }
  }, [foundUpdate, onReload, toast]);

  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;
    if (!foundUpdate && 'serviceWorker' in navigator) {
      (async () => {
        registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('updatefound', onUpdateFound);
        }
      })();
    }

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', onUpdateFound);
      }
    };
  }, [foundUpdate, onUpdateFound]);

  const tryToUpdate = useCallback(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      try {
        await registration.update();
      } catch (err) {
        console.error('SW: failed to update', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!foundUpdate && 'serviceWorker' in navigator) {
      const interval = setInterval(() => {
        if (!foundUpdate) {
          tryToUpdate();
        }
      }, checkForUpdatesIntervalMs);

      setTimeout(tryToUpdate, initialTimeoutMs);
      tryToUpdate();

      return () => clearInterval(interval);
    }
    return undefined;
  }, [foundUpdate, tryToUpdate]);

  return (
    <UpdatesContextProvider hasUpdate={foundUpdate}>
      {children}
    </UpdatesContextProvider>
  );
};
