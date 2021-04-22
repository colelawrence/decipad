import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderFour = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h4" fontSize="xl" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
