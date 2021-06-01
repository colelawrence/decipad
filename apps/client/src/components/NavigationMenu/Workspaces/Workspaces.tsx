import { Box } from '@chakra-ui/layout';
import { DeciRuntimeContext } from '@decipad/editor';
import React, { useContext, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { Item } from './Item/Item';

export const Workspaces = () => {
  const { runtime } = useContext(DeciRuntimeContext);

  const [_loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    let sub: Subscription;
    if (runtime) {
      sub = runtime.workspaces
        .list()
        .subscribe(({ loading, data: workspaces = [] }) => {
          setLoading(loading);
          setWorkspaces(workspaces);
        });
    }
    return () => sub.unsubscribe();
  }, [runtime]);

  return (
    <Box pt={2}>
      {workspaces && workspaces.map((w) => <Item key={w} workspaceId={w} />)}
    </Box>
  );
};
