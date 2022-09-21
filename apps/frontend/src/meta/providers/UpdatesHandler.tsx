import { useToast } from '@decipad/toast';
import { UpdatePrompt } from '@decipad/ui';
import { useCallback, useEffect, useState } from 'react';

const initialTimeoutMs = 10_000;
const checkForUpdatesIntervalMs = 60_000;

export const UpdatesHandler = () => {
  const toast = useToast();
  const [foundUpdate, setFoundUpdate] = useState(false);

  const onReload = useCallback(() => {
    window.location.reload();
  }, []);

  const onUpdateFound = useCallback(() => {
    if (!foundUpdate) {
      setFoundUpdate(true);
      toast(<UpdatePrompt onReload={onReload} />, 'warning', {
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
      registration.update();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!foundUpdate) {
        tryToUpdate();
      }
    }, checkForUpdatesIntervalMs);

    setTimeout(tryToUpdate, initialTimeoutMs);
    tryToUpdate();

    return () => clearInterval(interval);
  }, [foundUpdate, tryToUpdate]);

  return <></>;
};
