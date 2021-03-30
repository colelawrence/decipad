import { Box, Heading } from '@chakra-ui/layout';
import { DeciEditor } from '@decipad/editor';
import React from 'react';

const Home = () => {
  return (
    <Box p={10}>
      <Heading>Deci</Heading>
      <DeciEditor docId="testing-1" />
    </Box>
  );
};

export default Home;
