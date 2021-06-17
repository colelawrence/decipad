/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Square,
  Text,
} from '@chakra-ui/react';
import {
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
  GET_WORKSPACE_BY_ID,
  RemovePad,
  RemovePadVariables,
  REMOVE_PAD,
} from '@decipad/queries';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { FiFile, FiHelpCircle, FiTrash2 } from 'react-icons/fi';
import { SideMenu } from '../../components/SideMenu';
import { Topbar } from '../../components/Topbar';

const Workspace = () => {
  const router = useRouter();
  const [session, sessionLoading] = useSession();
  const { id } = router.query;

  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push('/');
    }
  }, [session, router, sessionLoading]);

  const { data, loading: workspaceLoading } = useQuery<
    GetWorkspaceById,
    GetWorkspaceByIdVariables
  >(GET_WORKSPACE_BY_ID, {
    variables: { id: typeof id === 'string' ? id : '' },
  });

  const [removePad] = useMutation<RemovePad, RemovePadVariables>(REMOVE_PAD);

  if (workspaceLoading || sessionLoading) {
    return <LoadingSpinnerPage />;
  }

  return (
    <Grid p={10} gridTemplateRows="auto 1fr" gridGap={6} minH="100vh">
      <Topbar workspaceId={id as string} />
      <Grid
        gridTemplateColumns="300px 1fr"
        borderTop="2px solid"
        borderColor="gray.100"
      >
        <SideMenu currentWorkspace={data?.getWorkspaceById} />
        <Box>
          <Heading p={6} mb={6}>
            All Pads
          </Heading>
          {data?.getWorkspaceById?.pads.items.length === 0 && (
            <Square h="100%" w="100%" pb="300px">
              <Box textAlign="center">
                <Heading size="4xl">
                  <span role="img" aria-label="sad-emoji">
                    😢
                  </span>
                </Heading>
                <Heading my={3}>You have no pads in your workspace...</Heading>
                <Text>
                  Create pads by pressing on the button on the top right corner
                  of your screen!
                </Text>
              </Box>
            </Square>
          )}
          {data?.getWorkspaceById?.pads.items.map((item) => (
            <Grid
              gridTemplateColumns="1fr auto"
              borderBottom="2px solid"
              borderColor="gray.100"
              mx={6}
            >
              <Box
                as={Link}
                href={`/${data.getWorkspaceById?.id}/${item.id}`}
                key={item.id}
              >
                <a>
                  <HStack py={6}>
                    <Icon as={FiFile} mr={3} fontSize="1.5rem" />
                    <Heading size="md" fontWeight="normal">
                      {item.name}
                    </Heading>
                  </HStack>
                </a>
              </Box>
              <Flex alignItems="center">
                <Button
                  onClick={() =>
                    removePad({
                      variables: { id: item.id },
                      refetchQueries: ['GetWorkspaceById'],
                      awaitRefetchQueries: true,
                    })
                  }
                >
                  <Icon as={FiTrash2} />
                </Button>
              </Flex>
            </Grid>
          ))}
        </Box>
      </Grid>
      <Button
        as="a"
        href="https://www.notion.so/decipad/Deci-101-3f3b513b9a82499080eef6eef87d8179"
        target="_blank"
        pos="absolute"
        right={10}
        bottom={10}
        leftIcon={<Icon as={FiHelpCircle} />}
      >
        Help & Documentation
      </Button>
    </Grid>
  );
};

export default Workspace;
