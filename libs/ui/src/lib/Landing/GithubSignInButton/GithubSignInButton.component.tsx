import { Button, Icon } from '@chakra-ui/react';
import { signIn } from 'next-auth/client';
import React from 'react';
import { FiGithub } from 'react-icons/fi';

export const GithubSignInButton = () => {
  return (
    <Button
      colorScheme="blackAlpha"
      bg="blackAlpha.800"
      _hover={{ bg: 'blackAlpha.900' }}
      mt={3}
      size="lg"
      leftIcon={<Icon as={FiGithub} />}
      onClick={() => signIn('github')}
    >
      Sign in With Github
    </Button>
  );
};
