import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box } from '@chakra-ui/layout';
import React from 'react';
import { FiSettings, FiUsers } from 'react-icons/fi';

export const BottomButton = () => {
  return (
    <Box w="100%" px={3} maxW="300px">
      <Button
        leftIcon={<Icon as={FiUsers} />}
        w="100%"
        justifyContent="flex-start"
        variant="ghost"
      >
        Explore Community
      </Button>
      <Button
        leftIcon={<Icon as={FiSettings} />}
        w="100%"
        justifyContent="flex-start"
        variant="ghost"
      >
        Workspace Preferences
      </Button>
    </Box>
  );
};
