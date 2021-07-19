import { DocSync } from '@decipad/docsync';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';

export type DocSyncContextProps =
  | { docsync: null; status: 'loading' | 'login' }
  | { docsync: DocSync; status: 'success' };

export const DocSyncContext = React.createContext<DocSyncContextProps>({
  docsync: null,
  status: 'loading',
});

export interface DocSyncProviderProps {
  children: JSX.Element;
}

export const DocSyncProvider = ({ children }: DocSyncProviderProps) => {
  const [session, sessionLoading] = useSession();
  const [value, setValue] = useState<DocSyncContextProps>({
    docsync: null,
    status: 'loading',
  });

  const userId = (session?.user as { id: string })?.id;

  useEffect(() => {
    if (sessionLoading) {
      return;
    } else if (userId) {
      const docsync = new DocSync({ userId, actorId: nanoid() });
      setValue({ docsync, status: 'success' });
      return () => docsync.stop();
    } else {
      return setValue({ docsync: null, status: 'login' });
    }
  }, [userId, session, sessionLoading]);

  return (
    <DocSyncContext.Provider value={value}>{children}</DocSyncContext.Provider>
  );
};

export const AnonymousDocSyncProvider = ({
  children,
}: DocSyncProviderProps) => {
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

export const useMaybeRuntime = () => {
  const { docsync } = useContext(DocSyncContext);
  return docsync;
};
