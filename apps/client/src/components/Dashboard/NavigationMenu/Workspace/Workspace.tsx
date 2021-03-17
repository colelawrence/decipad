import { Button, ButtonGroup } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Flex, HStack } from '@chakra-ui/layout';
import React from 'react';
import { FiEdit2, FiFolder, FiTrash2 } from 'react-icons/fi';
import { useStore } from '../../../../store';
import { AddNotebookButton } from './AddNotebookButton/AddNotebookButton';

export const Workspace = ({ id }: { id: string }) => {
  const workspace = useStore((state) => state.getWorkspace)(id);
  const setNotebooks = useStore((state) => state.setNotebooks);
  return (
    <Box
      _hover={{ bg: 'blue.50' }}
      transition="0.2s background-color ease-out"
      cursor="pointer"
      py={2}
      onMouseDown={() => setNotebooks(id)}
      px={5}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gridGap={5}>
          <Icon as={FiFolder} /> {workspace.name}
        </Flex>
        <ButtonGroup
          variant="unstyled"
          h="auto"
          gridGap={3}
          alignItems="center"
        >
          <Button h="auto" minW="auto" p="0px">
            <Icon as={FiTrash2} />
          </Button>
          <Button h="auto" minW="auto" p="0px">
            <Icon as={FiEdit2} />
          </Button>
          <AddNotebookButton id={id} />
        </ButtonGroup>
      </HStack>
    </Box>
  );
};
