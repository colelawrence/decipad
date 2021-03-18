import { useSession } from 'next-auth/client';
import React from 'react';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { Login } from '../components/Login/Login';

const Home = () => {
  const [session] = useSession();
  return (
    <>
      {!session && <Login />}
      {session && <Dashboard />}
    </>
  );
};

export default Home;
