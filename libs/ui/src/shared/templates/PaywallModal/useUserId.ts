import { useSession } from 'next-auth/react';

export function useUserId() {
  const { data } = useSession();

  if (data?.user == null) {
    throw new Error('useUserId should not be used if user is not logged in');
  }

  if (!('id' in data.user)) {
    throw new Error('id not present in field data.user');
  }

  if (typeof data.user.id !== 'string') {
    throw new Error('id should always be a string');
  }

  return data.user.id;
}
