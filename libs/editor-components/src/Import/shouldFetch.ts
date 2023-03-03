import { useSession } from 'next-auth/react';

type SessionContextValue = ReturnType<typeof useSession>;

export const shouldFetch = (
  session: SessionContextValue,
  createdByUserId: string
): boolean =>
  session.status === 'authenticated' &&
  session.data.user?.id === createdByUserId;
