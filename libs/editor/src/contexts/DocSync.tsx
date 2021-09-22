import { DocSync } from '@decipad/docsync';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/client';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type DocSyncContextProps = {
  docsync: DocSync | null;
  status: 'loading' | 'login' | 'success';
};

export const DocSyncContext = React.createContext<DocSyncContextProps>({
  docsync: null,
  status: 'loading',
});

export interface DocSyncProviderProps {
  children: JSX.Element;
}

export const DocSyncProvider = ({
  children,
}: DocSyncProviderProps): ReturnType<FC> => {
  const [session, sessionLoading] = useSession();
  const [value, setValue] = useState<DocSyncContextProps>({
    docsync: null,
    status: 'loading',
  });

  const userId = (session?.user as { id: string })?.id;
  const { search } = useLocation();
  const secret = new URLSearchParams(search).get('secret');

  useEffect(() => {
    if (sessionLoading) {
      return undefined;
    }
    if (userId || secret) {
      const docsync = new DocSync({ userId, actorId: nanoid() });
      if (secret) {
        docsync.setHeaders({
          Authorization: `Bearer ${secret}`,
        });
      }
      setValue({ docsync, status: userId ? 'success' : 'login' });
      return () => docsync.stop();
    }
    return setValue({ docsync: null, status: 'login' });
  }, [userId, session, sessionLoading, secret]);

  useEffect(() => {
    if (value.docsync) {
      value.docsync.setHeaders({
        Authorization: `Bearer ${secret}`,
      });
    }
  }, [secret, value.docsync]);

  return (
    <DocSyncContext.Provider value={value}>{children}</DocSyncContext.Provider>
  );
};

export const AnonymousDocSyncProvider = ({
  children,
}: DocSyncProviderProps): ReturnType<FC> => {
  const [value, setValue] = useState<DocSyncContextProps>({
    docsync: null,
    status: 'loading',
  });

  useEffect(() => {
    const docsync = new DocSync({
      userId: 'guest',
      actorId: nanoid(),
      isSynced: false,
    });
    setValue({
      docsync,
      status: 'success',
    });
    return () => docsync.stop();
  }, []);

  return (
    <DocSyncContext.Provider value={value}>{children}</DocSyncContext.Provider>
  );
};

export const useDocSync = (): DocSync => {
  const { docsync } = useContext(DocSyncContext);

  if (docsync == null) {
    throw new Error('DocSync is required');
  }

  return docsync;
};

export const useMaybeRuntime = (): DocSync | null => {
  const { docsync } = useContext(DocSyncContext);
  return docsync;
};
