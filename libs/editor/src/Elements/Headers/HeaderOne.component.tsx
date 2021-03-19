import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderOne = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h1" fontSize="4xl" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
