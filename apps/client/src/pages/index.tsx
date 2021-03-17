import { Button } from '@chakra-ui/button';
import { Box } from '@chakra-ui/layout';
import { DeciEditor } from '@decipad/editor';
import { signOut, useSession } from 'next-auth/client';
import React from 'react';
import { v4 } from 'uuid';
import { Login } from '../components/Login/Login';

const Home = () => {
  const [session] = useSession();
  return (
    <>
      {!session && <Login />}
      {session && (
        <Box>
          <Button onClick={() => signOut()}>Sign out</Button>
          <DeciEditor docId={v4()} />
        </Box>
      )}
    </>
  );
};

export default Home;
