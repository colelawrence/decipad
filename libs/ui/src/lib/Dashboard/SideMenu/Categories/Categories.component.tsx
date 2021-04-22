import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Divider } from '@chakra-ui/layout';
import React from 'react';
import { FiClock, FiFile, FiStar, FiTrash2 } from 'react-icons/fi';

export const Categories = () => {
  return (
    <Box w="100%" px={3} maxW="300px">
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiFile} />}
      >
        All Pads
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiStar} />}
      >
        Favourites
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiClock} />}
      >
        Recents
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiTrash2} />}
      >
        Recycle Bin
      </Button>
      <Divider my={3} />
    </Box>
  );
};
