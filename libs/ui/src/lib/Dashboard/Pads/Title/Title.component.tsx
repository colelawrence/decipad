import { Heading } from '@chakra-ui/layout';
import React from 'react';

export const Title = ({ text }: { text: string }) => {
  return <Heading fontSize="2xl">{text}</Heading>;
};
