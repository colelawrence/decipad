import { Box, Heading, HStack, Text } from '@chakra-ui/layout';
import React from 'react';
import { Notebook } from '../../../store';

export const Notebooks = ({ notebooks }: { notebooks: Notebook[] }) => {
  return (
    <Box borderRight="1px solid" borderColor="gray.100" pr={10}>
      {notebooks.map((notebook, i) => (
        <Box
          w="100%"
          bg={i === 1 ? 'blue.500' : 'gray.50'}
          color={i === 1 ? 'white' : 'black'}
          borderRadius="20px"
          mb={5}
          px={7}
          py={8}
          cursor="pointer"
          transition="0.2s background-color ease-out"
        >
          <Heading fontSize="xl">{notebook.name.toUpperCase()}</Heading>
          <Text pt={1} opacity={0.7}>
            Here we will have the first paragraph element of the notebook as a
            preview so that the user has an idea about the content of the
            notebook.
          </Text>
          <HStack w="100%" justifyContent="space-between" pt={5}>
            <Text>
              Last change:{' '}
              <Text as="span" fontWeight="bold">
                1 Minute Ago
              </Text>
            </Text>
          </HStack>
        </Box>
      ))}
    </Box>
  );
};
