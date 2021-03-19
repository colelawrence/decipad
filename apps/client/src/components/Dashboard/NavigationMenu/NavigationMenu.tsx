import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Text } from '@chakra-ui/layout';
import React from 'react';
import { FiClock, FiInbox, FiLayers, FiTrash2 } from 'react-icons/fi';

export const NavigationMenu = () => {
  return (
    <Box px={5} borderRight="1px solid" borderColor="gray.100">
      <Button
        w="100%"
        leftIcon={<Icon as={FiInbox} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Inbox
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiLayers} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Templates
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiClock} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Recents
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiTrash2} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Recycle Bin
      </Button>

      <Text pt={5} pl={4} opacity={0.5}>
        Workspaces
      </Text>
    </Box>
  );
};
