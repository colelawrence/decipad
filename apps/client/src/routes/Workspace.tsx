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
import { useToasts } from 'react-toast-notifications';
import {
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
  GET_WORKSPACE_BY_ID,
  RemovePad,
  RemovePadVariables,
  REMOVE_PAD,
} from '@decipad/queries';
import { HelpButton, LoadingSpinnerPage } from '@decipad/ui';
import { FiFile, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';
import { Topbar } from '../components/Topbar';
import { encode as encodeVanityUrlComponent } from '../lib/vanityUrlComponent';

export function Workspace({ workspaceId }: { workspaceId: string }) {
  const { data, loading: workspaceLoading } = useQuery<
    GetWorkspaceById,
    GetWorkspaceByIdVariables
  >(GET_WORKSPACE_BY_ID, {
    variables: { id: workspaceId },
    fetchPolicy: 'network-only',
  });

  const [removePad] = useMutation<RemovePad, RemovePadVariables>(REMOVE_PAD);

  const { addToast } = useToasts();

  if (workspaceLoading) {
    return <LoadingSpinnerPage />;
  }

  return (
    <Grid p={10} gridTemplateRows="auto 1fr" gridGap={6} minH="100vh">
      <Topbar workspaceId={workspaceId} />
      <Grid
        gridTemplateColumns="300px 1fr"
        borderTop="2px solid"
        borderColor="gray.100"
      >
        <SideMenu currentWorkspace={data?.getWorkspaceById} />
        <Box>
          <Heading p={6}>Notebooks</Heading>
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
              key={item.id}
              gridTemplateColumns="1fr auto"
              borderBottom="2px solid"
              borderColor="gray.100"
              mx={6}
            >
              <Box
                as={Link}
                to={`/workspaces/${
                  data.getWorkspaceById?.id
                }/pads/${encodeVanityUrlComponent(item.name, item.id)}`}
              >
                <HStack py={6}>
                  <Icon as={FiFile} mr={3} fontSize="1.5rem" />
                  <Heading size="md" fontWeight="normal">
                    {item.name}
                  </Heading>
                </HStack>
              </Box>
              <Flex alignItems="center">
                <Button
                  onClick={() =>
                    removePad({
                      variables: { id: item.id },
                      refetchQueries: ['GetWorkspaceById'],
                      awaitRefetchQueries: true,
                    })
                      .then(() =>
                        addToast('Pad removed', { appearance: 'info' })
                      )
                      .catch((err) =>
                        addToast('Error removing pad: ' + err.message, {
                          appearance: 'error',
                        })
                      )
                  }
                >
                  <Icon as={FiTrash2} />
                </Button>
              </Flex>
            </Grid>
          ))}
        </Box>
      </Grid>
      <HelpButton />
    </Grid>
  );
}
