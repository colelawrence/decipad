import { DeciRuntime } from '@decipad/runtime';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/client';
import React, { useContext, useEffect, useState } from 'react';

export type DeciRuntimeContextProps =
  | { runtime: null; status: 'loading' | 'login' }
  | { runtime: DeciRuntime; status: 'success' };

export const DeciRuntimeContext = React.createContext<DeciRuntimeContextProps>({
  runtime: null,
  status: 'loading',
});

export const DeciRuntimeConsumer = DeciRuntimeContext.Consumer;

export interface DeciRuntimeProviderProps {
  children: JSX.Element;
}

export const DeciRuntimeProvider = ({ children }: DeciRuntimeProviderProps) => {
  const [session, sessionLoading] = useSession();
  const [value, setValue] = useState<DeciRuntimeContextProps>({
    runtime: null,
    status: 'loading',
  });

  const userId = (session?.user as { id: string })?.id;

  useEffect(() => {
    if (sessionLoading) {
      return;
    } else if (userId) {
      const runtime = new DeciRuntime(userId, nanoid());
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
    <DeciRuntimeContext.Provider value={value}>
      {children}
    </DeciRuntimeContext.Provider>
  );
};

export const useRuntime = (): DeciRuntime => {
  const { runtime } = useContext(DeciRuntimeContext);

  if (runtime == null) {
    throw new Error('Runtime is required');
  }

  return runtime;
};

export const useMaybeRuntime = () => {
  const { runtime } = useContext(DeciRuntimeContext);
  return runtime;
};
