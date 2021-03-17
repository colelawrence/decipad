import { Box, Heading, HStack } from '@chakra-ui/layout';
import React from 'react';
import { useStore } from '../../../store';
import { AddWorkspaceButton } from './AddWorkspaceButton/AddWorkspaceButton';
import { Workspace } from './Workspace/Workspace';

export const NavigationMenu = () => {
  const workspaces = useStore((state) => state.workspaces);
  return (
    <Box py={5} borderRight="1px solid" borderColor="gray.100" px={5}>
      <HStack justifyContent="space-between" pl={5} pr={2}>
        <Heading fontSize="2xl">Workspaces</Heading>
        <AddWorkspaceButton />
      </HStack>
      <Box pt={5}>
        {workspaces.map((workspace) => (
          <Workspace key={workspace.id} id={workspace.id} />
        ))}
      </Box>
    </Box>
  );
};
