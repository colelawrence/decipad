import { Center, Text } from '@chakra-ui/layout';
import { Button, Heading, Icon } from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import React from 'react';
import { FiGithub } from 'react-icons/fi';

const Home = () => {
  const [session, loading] = useSession();

  if (typeof window !== 'undefined' && loading) return null;

  if (!session) {
    return (
      <Center h="100vh" w="100vw">
        <Heading fontSize="5xl">Deci.</Heading>
        <Heading fontSize="3xl" pt={1} fontWeight="normal">
          Make sense of numbers.
        </Heading>
        <Text mt={1}>Start your Deci journey by signing up!</Text>
        <Button
          bg="blackAlpha.900"
          mt={5}
          color="white"
          _hover={{ bg: 'blackAlpha.900' }}
          leftIcon={<Icon as={FiGithub} />}
          onClick={() => signIn('github')}
        >
          Sign in with Github
        </Button>
      </Center>
    );
  }
};

export default Home;
