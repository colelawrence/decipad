import { Button, Center, Heading, Icon, Image } from '@chakra-ui/react';
import { signIn } from 'next-auth/client';
import React from 'react';
import { FiGithub } from 'react-icons/fi';

export const Login = () => {
  return (
    <Center
      h="100vh"
      flexDir="column"
      justifyContent="center"
      textAlign="center"
    >
      <Image
        src="/assets/deci-logo-brand.png"
        alt="Deci logo"
        width="100px"
        height="100px"
      />
      <Heading fontSize="2xl" mt={3}>
        Make sense of your decisions.
      </Heading>
      <Button
        onClick={() => signIn('github')}
        bg="black"
        color="white"
        mt={3}
        _hover={{ bg: 'black' }}
      >
        <Icon as={FiGithub} mr={3} /> Sign in with Github
      </Button>
    </Center>
  );
};
