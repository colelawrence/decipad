import { Container } from '@chakra-ui/layout';
import { DeciEditor } from '@decipad/editor';
import React from 'react';
import { v4 } from 'uuid';

const Home = () => {
  return (
    <Container py="30px">
      <DeciEditor docId={v4()} />
    </Container>
  );
};

export default Home;
