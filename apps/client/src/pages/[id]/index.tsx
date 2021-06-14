import { useQuery } from '@apollo/client';
import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { GET_PADS } from '../../operations/queries/GET_PADS';
import { GET_WORKSPACE_BY_ID } from '../../operations/queries/GET_WORKSPACE_BY_ID';
import {
  GetPads,
  GetPadsVariables,
} from '../../operations/queries/__generated__/GetPads';
import {
  GetWorkspaceById,
  GetWorkspaceByIdVariables,
} from '../../operations/queries/__generated__/GetWorkspaceById';

const Workspace = () => {
  const router = useRouter();
  const { id } = router.query;

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

  if (workspaceLoading || padsLoading) {
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
    </Box>
  );
};

export default Workspace;
