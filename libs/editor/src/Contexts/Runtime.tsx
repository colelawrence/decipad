import { DeciRuntime } from '@decipad/runtime';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';

export type RuntimeContextProps =
  | { runtime: null; status: 'loading' | 'login' }
  | { runtime: DeciRuntime; status: 'success' };

export const RuntimeContext = React.createContext<RuntimeContextProps>({
  runtime: null,
  status: 'loading',
});

export interface RuntimeProviderProps {
  children: JSX.Element;
}

export const RuntimeProvider = ({ children }: RuntimeProviderProps) => {
  const [session, sessionLoading] = useSession();
  const [value, setValue] = useState<RuntimeContextProps>({
    runtime: null,
    status: 'loading',
  });

  const userId = (session?.user as { id: string })?.id;

  useEffect(() => {
    if (sessionLoading) {
      return;
    } else if (userId) {
      const runtime = new DeciRuntime({ userId, actorId: nanoid() });
      runtime.setSession(session);
      setValue({
        runtime,
        status: 'success',
      });
      return () => runtime.stop();
    } else {
      return setValue({ runtime: null, status: 'login' });
    }
  }, [userId, session, sessionLoading]);

  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
};

export const AnonymousRuntimeProvider = ({
  children,
}: RuntimeProviderProps) => {
  const [value, setValue] = useState<RuntimeContextProps>({
    runtime: null,
    status: 'loading',
  });

  useEffect(() => {
    const runtime = new DeciRuntime({
      userId: '',
      actorId: '',
      isSynced: false,
    });
    setValue({
      runtime,
      status: 'success',
    });
    return () => runtime.stop();
  }, []);

  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
};

export const useRuntime = (): DeciRuntime => {
  const { runtime } = useContext(RuntimeContext);

  if (runtime == null) {
    throw new Error('Runtime is required');
  }

  return runtime;
};

export const useMaybeRuntime = () => {
  const { runtime } = useContext(RuntimeContext);
  return runtime;
};
