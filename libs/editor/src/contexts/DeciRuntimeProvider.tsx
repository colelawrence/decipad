/* eslint-disable  react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/client';import { User } from 'next-auth';
import { DeciRuntimeContext } from './DeciRuntimeContext';
import { DeciRuntime } from '@decipad/runtime';
import { nanoid } from 'nanoid';

export function DeciRuntimeProvider({ children }) {
  const [session, loading] = useSession();
  const [runtime, setRuntime] = useState(null);

  const userId = (session?.user as {id: string})?.id;

  useEffect(() => {
    if (userId) {
      const r = new DeciRuntime(userId, nanoid());
      r.setSession(session);
      setRuntime(r);
      return () => r.stop();
    } else {
      setRuntime(null);
    }
  }, [userId]);

  return (
    <DeciRuntimeContext.Provider value={{ runtime, loading }}>
      {children}
    </DeciRuntimeContext.Provider>
  );
}
