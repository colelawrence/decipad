import { Box, Center, Circle, Heading, HStack, Text } from '@chakra-ui/layout';
import { useRouter } from 'next/router';
import React from 'react';
import { useWorkspaces } from '../../workspaces.store';

export const Notebooks = ({ workspaceId }: { workspaceId?: string }) => {
  const router = useRouter();
  const workspace = useWorkspaces((state) => state.workspaces).find(
    (w) => w.id === workspaceId
  );

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
      {workspace &&
        workspace.notebooks.map((n) => (
          <Box
            key={n.id}
            px={10}
            transition="0.2s ease-out"
            py={5}
            bg={router.query.notebook === n.id ? 'blue.50' : 'gray.50'}
            mb={4}
            borderRadius={15}
            cursor="pointer"
            onMouseDown={() =>
              router.push(`/?workspace=${workspaceId}&notebook=${n.id}`)
            }
          >
            <HStack justifyContent="space-between">
              <Heading fontSize="xl">{n.name}</Heading>
              <Circle
                boxSizing="content-box"
                h="10px"
                transition="0.2s ease-out"
                w="10px"
                border="5px solid"
                borderColor={
                  router.query.notebook === n.id ? 'blue.500' : 'transparent'
                }
                bg={router.query.notebook === n.id ? 'blue.300' : 'transparent'}
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
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore
              culpa perspiciatis quae rerum odit doloribus cupiditate illum,
              exercitationem quos, deleniti officiis cumque possimus esse vitae
              quam suscipit sint! Numquam, vitae.
            </Text>
          </Box>
        ))}
    </Box>
  );
};
