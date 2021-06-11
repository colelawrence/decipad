import { Dashboard, Landing, LoadingSpinnerPage } from '@decipad/ui';
import { useSession } from 'next-auth/client';
import React from 'react';

const Home = () => {
  const [session, loading] = useSession();

  if (loading) return <LoadingSpinnerPage />;

  if (session) return <Dashboard />;

  return <Landing />;
};

export default Home;
