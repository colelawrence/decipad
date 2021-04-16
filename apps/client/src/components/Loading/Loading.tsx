import { Center, Heading } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';

export function Loading() {
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

      <Heading fontSize="3xl" mt={3}>
        Please wait...
      </Heading>
    </Center>
  );
}
