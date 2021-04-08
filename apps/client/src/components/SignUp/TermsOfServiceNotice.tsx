import { Box, Center, Link, Text } from '@chakra-ui/react';
import React from 'react';

export const TermsOfServiceNotice = () => {
  return (
    <Box textAlign="center">
      <Center>
        <Text maxW="40ch" opacity={0.6}>
          You acknoledge that you read and agree to our{' '}
          <Link
            textDecor="underline"
            fontWeight="bold"
            _hover={{ color: 'dodgerblue' }}
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            textDecor="underline"
            fontWeight="bold"
            _hover={{ color: 'dodgerblue' }}
          >
            Terms of Service
          </Link>
          .
        </Text>
      </Center>
    </Box>
  );
};
