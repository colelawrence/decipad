import { useQuery } from '@apollo/client';
import { GET_WORKSPACES, Workspaces } from '@decipad/queries';
import { Landing, LoadingSpinnerPage } from '@decipad/ui';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const query = useQuery<Workspaces>(GET_WORKSPACES);

  useEffect(() => {
    if (session && !loading) {
      query.refetch().then((res) => {
        router.push(`/${res.data.workspaces[0].id}`);
      });
    }
  }, [session, router, query, loading]);

  if (loading) return <LoadingSpinnerPage />;

  if (!session) return <Landing />;

  return null;
};

export default Home;
