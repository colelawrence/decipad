import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Box, Text } from '@chakra-ui/layout';
import React from 'react';
import { FiPieChart, FiTag } from 'react-icons/fi';

export const Tags = () => {
  return (
    <Box w="100%" px={3} maxW="300px">
      <Text fontWeight="bold" pl={4} mb={3}>
        Tags
      </Text>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiTag} />}
      >
        Untagged
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiPieChart} />}
      >
        Hiring Plan
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiPieChart} />}
      >
        Business costs
      </Button>
      <Button
        w="100%"
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={FiPieChart} />}
      >
        Team costs
      </Button>
    </Box>
  );
};
