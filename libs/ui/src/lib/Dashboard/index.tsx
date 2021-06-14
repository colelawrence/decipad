import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Image,
  Square,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/client';
import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const GET_ALL_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
    }
  }
`;

export const Dashboard = () => {
  const [session] = useSession();

  const { data } = useQuery(GET_ALL_WORKSPACES);

  if (!session) return null;

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

        {data && JSON.stringify(data)}
      </Box>
    </Square>
  );
};
