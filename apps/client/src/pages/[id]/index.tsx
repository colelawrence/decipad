import { useQuery } from '@apollo/client';
import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import {
  GetPads,
  GetPadsVariables,
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
  GET_PADS,
  GET_WORKSPACE_BY_ID,
} from '@decipad/queries';
import { Dashboard, LoadingSpinnerPage } from '@decipad/ui';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Workspace = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const { id } = router.query;

  useEffect(() => {
    if (!session && !loading) {
      router.push('/');
    }
  }, [session, router, loading]);

  const { data: workspace, loading: workspaceLoading } = useQuery<
    GetWorkspaceById,
    GetWorkspaceByIdVariables
  >(GET_WORKSPACE_BY_ID, {
    variables: { id: typeof id === 'string' ? id : '' },
  });

  const { data: pads, loading: padsLoading } = useQuery<
    GetPads,
    GetPadsVariables
  >(GET_PADS, {
    variables: { workspaceId: workspace?.getWorkspaceById?.id || '' },
  });

  if (workspaceLoading || padsLoading || loading) {
    return <LoadingSpinnerPage />;
  }

  return (
    <Box p={10}>
      <Heading>
        Current Workspace: {workspace?.getWorkspaceById?.name} -{' '}
        {workspace?.getWorkspaceById?.id}
      </Heading>
      Your pads:
      <UnorderedList>
        {pads?.pads.items.map((item) => (
          <ListItem key={item.id}>
            {item.name} - {item.id}
          </ListItem>
        ))}
      </UnorderedList>
      <Dashboard />
    </Box>
  );
};

export default Workspace;
