import { Box, Center, Circle, Heading, HStack, Text } from '@chakra-ui/layout';
import { useRouter } from 'next/router';
import React, { useContext, useState, useEffect } from 'react';
import { DeciRuntimeContext } from '@decipad/editor';
import { Item } from './Item/Item';

export const Notebooks = ({ workspaceId }: { workspaceId?: string }) => {
  const router = useRouter();
  const { runtime } = useContext(DeciRuntimeContext);
  const [loading, setLoading] = useState(false);
  const [padIds, setPadIds] = useState([]);
  useEffect(() => {
    if (workspaceId) {
      const sub = runtime
        .workspace(workspaceId)
        .pads.list()
        .subscribe(({ loading, data: padIds }) => {
          setLoading(loading);
          setPadIds(padIds);
        });

      return () => sub.unsubscribe();
    }
  }, [runtime, workspaceId]);

  return (
    <Box px={10} borderRight="1px solid" borderColor="gray.100">
      {!workspaceId && (
        <Center h="100%" flexDir="column" opacity={0.4}>
          <Heading textAlign="center" fontWeight="normal">
            Such empty
          </Heading>
          <Text>You should select a workspace or create new notebooks!</Text>
        </Center>
      )}
      {padIds &&
        padIds.map((padId) => (
          <Item key={padId} id={padId} workspaceId={workspaceId} />
        ))}
    </Box>
  );
};
