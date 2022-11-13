import { useToast } from '@decipad/toast';
import { toastTransitionDelay, UpdatePrompt } from '@decipad/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const initialTimeoutMs = 10_000;
const checkForUpdatesIntervalMs = 60_000;

export const UpdatesHandler = () => {
  const toast = useToast();
  const [foundUpdate, setFoundUpdate] = useState(false);
  const onReload = useCallback(() => window.location.reload(), []);
  const onUpdateFound = useCallback(() => setFoundUpdate(true), []);
  const { pathname } = useLocation();
  const reloading = useRef(false);

  useEffect(() => {
    if (foundUpdate && !reloading.current && !pathname.startsWith('/n/')) {
      reloading.current = true;
      toast(<UpdatePrompt onReload={onReload} />, 'info', {
        autoDismiss: true,
      });
      setTimeout(onReload, toastTransitionDelay);
    }
  }, [foundUpdate, onReload, pathname, toast]);

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
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!foundUpdate && 'serviceWorker' in navigator) {
      const interval = setInterval(async () => {
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

  return <></>;
};
