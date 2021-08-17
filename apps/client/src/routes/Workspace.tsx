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
} from '@chakra-ui/react';
import {
  CountPadsVariables,
  COUNT_PADS,
  CreatePad,
  CreatePadVariables,
  CREATE_PAD,
  DuplicatePad,
  DuplicatePadVariables,
  DUPLICATE_PAD,
  GetPadsVariables,
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
  GET_PADS,
  GET_WORKSPACES,
  GET_WORKSPACE_BY_ID,
  RemovePad,
  RemovePadVariables,
  REMOVE_PAD,
} from '@decipad/queries';
import { EmptyWorkspaceCta, HelpButton, LoadingSpinnerPage } from '@decipad/ui';
import { FC, useCallback, useState } from 'react';
import { FiFile, FiTrash2, FiCopy } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { SideMenu } from '../components/SideMenu';
import { Topbar } from '../components/Topbar';
import { encode as encodeVanityUrlComponent } from '../lib/vanityUrlComponent';

export function Workspace({
  workspaceId,
}: {
  workspaceId: string;
}): ReturnType<FC> {
  const history = useHistory();

  const { addToast } = useToasts();

  const { data, loading: workspaceLoading } = useQuery<
    GetWorkspaceById,
    GetWorkspaceByIdVariables
  >(GET_WORKSPACE_BY_ID, {
    variables: { id: workspaceId },
    fetchPolicy: 'network-only',
  });

  const [removePad] = useMutation<RemovePad, RemovePadVariables>(REMOVE_PAD);
  const [duplicatePad] =
    useMutation<DuplicatePad, DuplicatePadVariables>(DUPLICATE_PAD);
  const [createPad] = useMutation<CreatePad, CreatePadVariables>(CREATE_PAD, {
    refetchQueries: [
      { query: GET_WORKSPACES },
      { query: COUNT_PADS, variables: { workspaceId } as CountPadsVariables },
      { query: GET_PADS, variables: { workspaceId } as GetPadsVariables },
    ],
  });

  const [creatingPad, setCreatingPad] = useState(false);
  const handleCreateNotebook = useCallback(async () => {
    if (!creatingPad) {
      setCreatingPad(true);
      try {
        const { data: creation } = await createPad({
          variables: {
            workspaceId,
            name: '',
          },
        });
        if (!creation) {
          throw new Error('No pad creation result');
        }
        const newPad = creation.createPad;
        addToast('Pad created successfully', { appearance: 'success' });
        history.push(
          `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
            '',
            newPad.id
          )}`
        );
      } catch (err) {
        addToast(`Error creating pad: ${err.message}`, {
          appearance: 'error',
        });
      } finally {
        setCreatingPad(false);
      }
    }
  }, [creatingPad, createPad, workspaceId, addToast, history]);

  if (workspaceLoading) {
    return <LoadingSpinnerPage />;
  }
  if (!data) {
    throw new Error(`Failed to load workspace ${workspaceId}`);
  }
  const workspace = data.getWorkspaceById;
  if (!workspace) {
    return <>Workspace not found</>;
  }

  return (
    <Grid gridTemplateRows="auto 1fr" height="100%">
      <Topbar
        workspaceId={workspaceId}
        onCreateNotebook={handleCreateNotebook}
      />
      <Grid
        gridTemplateColumns="272px 1fr"
        borderTop="2px solid"
        borderColor="gray.100"
      >
        <SideMenu currentWorkspace={workspace} />
        <Grid gridTemplateRows="1fr auto">
          {workspace.pads.items.length === 0 && (
            <EmptyWorkspaceCta
              Heading="h1"
              onCreateNotebook={handleCreateNotebook}
            />
          )}
          {workspace.pads.items.map((item) => (
            <Box key={item.id}>
              <Heading p={6}>Notebooks</Heading>
              <Grid
                gridTemplateColumns="1fr auto"
                borderBottom="2px solid"
                borderColor="gray.100"
                mx={6}
              >
                <Box
                  as={Link}
                  to={`/workspaces/${
                    workspace.id
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
                    alt="Duplicate Notebook"
                    onClick={() =>
                      duplicatePad({
                        variables: { id: item.id },
                        refetchQueries: ['GetWorkspaceById'],
                        awaitRefetchQueries: true,
                      })
                        .then(() =>
                          addToast('Pad duplicated', { appearance: 'info' })
                        )
                        .catch((err) =>
                          addToast(`Error duplicating pad: ${err.message}`, {
                            appearance: 'error',
                          })
                        )
                    }
                  >
                    <Icon as={FiCopy} />
                  </Button>
                  <Button
                    alt="Remove Notebook"
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
                          addToast(`Error removing pad: ${err.message}`, {
                            appearance: 'error',
                          })
                        )
                    }
                  >
                    <Icon as={FiTrash2} />
                  </Button>
                </Flex>
              </Grid>
            </Box>
          ))}
          <HelpButton />
        </Grid>
      </Grid>
    </Grid>
  );
}
