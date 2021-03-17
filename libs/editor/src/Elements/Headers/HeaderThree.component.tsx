import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderThree = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h3" fontSize="2xl" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
