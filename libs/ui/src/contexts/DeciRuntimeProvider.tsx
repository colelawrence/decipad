import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/client';
import { DeciRuntimeContext } from './DeciRuntimeContext';
import { DeciRuntime } from '@decipad/runtime';
import { nanoid } from 'nanoid';

export function DeciRuntimeProvider({ children }) {
  const [session, loading] = useSession();
  const [runtime, setRuntime] = useState(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      const r = new DeciRuntime(userId as string, nanoid());
      r.setSession(session);
      setRuntime(r);
      return () => r.stop();
    }
  }, [userId, session]);

  return (
    <DeciRuntimeContext.Provider value={{ runtime, loading }}>
      {children}
    </DeciRuntimeContext.Provider>
  );
}
