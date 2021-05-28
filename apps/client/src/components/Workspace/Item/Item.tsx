import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Circle, Heading, HStack, Text } from '@chakra-ui/layout';
import { DeciRuntimeContext } from '@decipad/editor';

export const Item = ({ id, workspaceId }) => {
  const router = useRouter();
  const { runtime } = useContext(DeciRuntimeContext);
  const [loading, setLoading] = useState(false);
  const [pad, setPad] = useState(null);
  useEffect(() => {
    const sub = runtime
      .workspace(workspaceId)
      .pads.get(id)
      .subscribe(({ loading, data: pad }) => {
        setLoading(loading);
        setPad(pad);
      });

    return () => sub.unsubscribe();
  }, [runtime, id, workspaceId]);

  if (loading || !pad) {
    return <span>Loading...</span>;
  }

  return (
    <Box
      px={10}
      transition="0.2s ease-out"
      py={5}
      bg={router.query.notebook === id ? 'blue.50' : 'gray.50'}
      mb={4}
      borderRadius={15}
      cursor="pointer"
      onMouseDown={() => router.push(`/workspaces/${workspaceId}/pads/${id}`)}
    >
      <HStack justifyContent="space-between">
        <Heading fontSize="xl">{pad.name}</Heading>
        <Circle
          boxSizing="content-box"
          h="10px"
          transition="0.2s ease-out"
          w="10px"
          border="5px solid"
          borderColor={
            router.query.notebook === id ? 'blue.500' : 'transparent'
          }
          bg={router.query.notebook === id ? 'blue.300' : 'transparent'}
        />
      </HStack>
      <Text
        pt={3}
        opacity={0.5}
        w="400px"
        overflow="hidden"
        lineHeight="1.8rem"
        maxH="4.2rem"
      >
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore culpa
        perspiciatis quae rerum odit doloribus cupiditate illum, exercitationem
        quos, deleniti officiis cumque possimus esse vitae quam suscipit sint!
        Numquam, vitae.
      </Text>
    </Box>
  );
};
