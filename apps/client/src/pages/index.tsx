import { DeciEditor } from '@decipad/editor';
import React from 'react';
import { v4 } from 'uuid';

const Home = () => {
  return <DeciEditor docId={v4()} />;
};

export default Home;
