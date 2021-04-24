import { Box } from '@chakra-ui/layout';
import React, { useContext, useEffect, useState } from 'react';
import { Item } from './Item/Item';
import { DeciRuntimeContext } from '@decipad/editor';

export const Workspaces = () => {
  const { runtime } = useContext(DeciRuntimeContext);

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const sub = runtime.workspaces
      .list()
      .subscribe(({ loading, data: workspaces = [] }) => {
        setLoading(loading);
        setWorkspaces(workspaces);
      });

    return () => sub.unsubscribe();
  }, [runtime]);

  return (
    <Box pt={2}>
      {workspaces && workspaces.map((w) => <Item key={w} workspaceId={w} />)}
    </Box>
  );
};
