import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Image } from '@chakra-ui/image';
import { Box, Center, Heading, Square } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Landing } from '@decipad/ui';
import { signOut, useSession } from 'next-auth/client';
import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const Home = () => {
  const [session, loading] = useSession();

  if (session) {
    return (
      <Square minH="100vh">
        <Box textAlign="center">
          <Center mb={3}>
            <Image
              src={session.user?.image as string}
              width={100}
              height={100}
              borderRadius="full"
            />
          </Center>
          <Heading size="lg">Signed in as {session.user?.name}</Heading>
          <Button
            onClick={() => signOut()}
            mt={3}
            colorScheme="blackAlpha"
            bg="blackAlpha.800"
            _hover={{ bg: 'blackAlpha.900' }}
            leftIcon={<Icon as={FiLogOut} />}
          >
            Sign Out
          </Button>
        </Box>
      </Square>
    );
  }

  if (loading) {
    return (
      <Square h="100vh" w="100vw">
        <Spinner size="xl" />
      </Square>
    );
  }

  return <Landing />;
};

export default Home;
