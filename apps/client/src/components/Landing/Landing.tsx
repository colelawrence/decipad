import { Button, Heading, Icon, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/client';
import React from 'react';
import { FiGithub } from 'react-icons/fi';

export const Landing = () => {
  return (
    <>
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
    </>
  );
};
