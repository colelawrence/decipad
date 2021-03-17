import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderFive = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h5" fontSize="lg" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
