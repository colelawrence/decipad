import { Box } from '@chakra-ui/layout';
import React from 'react';
import { useWorkspaces } from '../../workspaces.store';
import { Item } from './Item/Item';

export const Workspaces = () => {
  const workspaces = useWorkspaces((state) => state.workspaces);
  return (
    <Box pt={2}>
      {workspaces.map((w) => (
        <Item key={w.id} workspace={w} />
      ))}
    </Box>
  );
};
